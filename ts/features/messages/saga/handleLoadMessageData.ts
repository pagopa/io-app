import { constUndefined, pipe } from "fp-ts/lib/function";
import * as B from "fp-ts/lib/boolean";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { call, delay, put, race, select, take } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import { ServiceId } from "../../../../definitions/backend/ServiceId";
import {
  RequestGetMessageDataActionType,
  cancelGetMessageDataAction,
  getMessageDataAction,
  loadThirdPartyMessage
} from "../store/actions";
import { getPaginatedMessageById } from "../../../store/reducers/entities/messages/paginatedById";
import {
  UIMessage,
  UIMessageDetails,
  UIMessageId
} from "../../../store/reducers/entities/messages/types";
import { serviceByIdSelector } from "../../../store/reducers/entities/services/servicesById";
import {
  loadMessageById,
  loadMessageDetails,
  upsertMessageStatusAttributes
} from "../../../store/actions/messages";
import { loadServiceDetail } from "../../../store/actions/services";
import { messageDetailsByIdSelector } from "../../../store/reducers/entities/messages/detailsById";
import { thirdPartyFromIdSelector } from "../../../store/reducers/entities/messages/thirdPartyById";
import { isLoadingOrUpdatingInbox } from "../../../store/reducers/entities/messages/allPaginated";
import { TagEnum } from "../../../../definitions/backend/MessageCategoryPN";
import { euCovidCertificateEnabled } from "../../../config";
import { isPnEnabledSelector } from "../../../store/reducers/backendStatus";
import { trackPNPushOpened } from "../../pn/analytics";
import { isTestEnv } from "../../../utils/environment";
import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/ThirdPartyMessageWithContent";
import {
  trackMessageDataLoadFailure,
  trackMessageDataLoadPending,
  trackMessageDataLoadRequest,
  trackMessageDataLoadSuccess,
  trackRemoteContentMessageDecodingWarning
} from "../analytics";
import { RemoteContentDetails } from "../../../../definitions/backend/RemoteContentDetails";

export function* handleLoadMessageData(
  action: ActionType<typeof getMessageDataAction.request>
) {
  yield* race({
    polling: call(loadMessageData, action.payload),
    cancelAction: take(cancelGetMessageDataAction)
  });
}

function* loadMessageData({
  messageId,
  fromPushNotification
}: RequestGetMessageDataActionType) {
  trackMessageDataLoadRequest(fromPushNotification);
  while (true) {
    // Make sure that the later `loadMessageById` and `setMessageReadState`
    // are called after any  update on the message list has ended, otherwise
    // we may change the local "read" state of a message and later have it
    // been rewritten by a server delayed response to the ongoing concurrent
    // message list retrieval (this is mostly happening when not coming from
    // an user tap on the message list, like selecting a push notification)
    const isSynchronizingInbox = yield* select(isLoadingOrUpdatingInbox);
    if (!isSynchronizingInbox) {
      break;
    }

    trackMessageDataLoadPending(fromPushNotification);

    yield* delay(500);
  }

  // Make sure that we have the basic message details
  const paginatedMessage = yield* call(getPaginatedMessage, messageId);
  if (!paginatedMessage) {
    const phase = "paginatedMessage";
    trackMessageDataLoadFailure(fromPushNotification, phase);
    yield* put(getMessageDataAction.failure({ phase }));
    return;
  }

  // Load the service details asynchronously if we do not have them
  // (this is a not blocking call)
  const serviceId = paginatedMessage.serviceId;
  yield* call(getService, serviceId);

  // Make sure that we have the message details
  const messageDetails = yield* call(getMessageDetails, messageId);
  if (!messageDetails) {
    const phase = "messageDetails";
    trackMessageDataLoadFailure(fromPushNotification, phase);
    yield* put(getMessageDataAction.failure({ phase }));
    return;
  }

  // If coming from a push notification, we must not show the message details
  // when there are messages preconditions that have to be accepted by the user
  // before reading the message's details. PN is a special case where there
  // are always preconditions and we cannot rely on the `hasPrecondition` flag
  // due to compatibility with older messages
  const isPNMessage = paginatedMessage.category.tag === "PN";
  if (
    fromPushNotification &&
    (isPNMessage || paginatedMessage.hasPrecondition)
  ) {
    const phase = "preconditions";
    trackMessageDataLoadFailure(fromPushNotification, phase);
    if (isPNMessage) {
      trackPNPushOpened();
    }
    yield* put(
      getMessageDataAction.failure({
        blockedFromPushNotificationOpt: true,
        phase
      })
    );
    return;
  }

  // Make sure to download the third party data if the message has them
  // (PN is always a third party message so in that case make sure to
  // download it regardless of what is in messageDetails)
  const shouldDownloadThirdPartyData =
    messageDetails.hasThirdPartyData || isPNMessage;
  if (shouldDownloadThirdPartyData) {
    const thirdPartyMessageDetails = yield* call(
      getThirdPartyDataMessage,
      messageId,
      isPNMessage,
      serviceId,
      paginatedMessage.category.tag
    );
    if (!thirdPartyMessageDetails) {
      const phase = "thirdPartyMessageDetails";
      trackMessageDataLoadFailure(fromPushNotification, phase);
      yield* put(getMessageDataAction.failure({ phase }));
      return;
    }
  }

  const messageReadCheckSucceded = yield* call(
    setMessageReadIfNeeded,
    paginatedMessage
  );
  if (!messageReadCheckSucceded) {
    const phase = "readStatusUpdate";
    trackMessageDataLoadFailure(fromPushNotification, phase);
    yield* put(getMessageDataAction.failure({ phase }));
    return;
  }

  trackMessageDataLoadSuccess(fromPushNotification);
  yield* call(dispatchSuccessAction, paginatedMessage, messageDetails);
}

function* getPaginatedMessage(messageId: UIMessageId) {
  const initialMessagePot = yield* select(getPaginatedMessageById, messageId);
  if (!pot.isSome(initialMessagePot) || pot.isError(initialMessagePot)) {
    yield* put(loadMessageById.request({ id: messageId }));

    const outputAction = yield* take([
      loadMessageById.success,
      loadMessageById.failure
    ]);
    if (isActionOf(loadMessageById.failure, outputAction)) {
      return undefined;
    }

    const finalMessagePot = yield* select(getPaginatedMessageById, messageId);
    return pot.toUndefined(finalMessagePot);
  }

  return pot.toUndefined(initialMessagePot);
}

function* getService(serviceId: ServiceId) {
  const servicePot = yield* select(serviceByIdSelector, serviceId);
  if (!pot.isSome(servicePot) || pot.isError(servicePot)) {
    yield* put(loadServiceDetail.request(serviceId));
  }
}

function* getMessageDetails(messageId: UIMessageId) {
  const initialMessageDetailsPot = yield* select(
    messageDetailsByIdSelector,
    messageId
  );
  if (
    !pot.isSome(initialMessageDetailsPot) ||
    pot.isError(initialMessageDetailsPot)
  ) {
    yield* put(loadMessageDetails.request({ id: messageId }));

    const outputAction = yield* take([
      loadMessageDetails.success,
      loadMessageDetails.failure
    ]);
    if (isActionOf(loadMessageDetails.failure, outputAction)) {
      return undefined;
    }

    const finalMessageDetailsPot = yield* select(
      messageDetailsByIdSelector,
      messageId
    );
    return pot.toUndefined(finalMessageDetailsPot);
  }

  return pot.toUndefined(initialMessageDetailsPot);
}

function* getThirdPartyDataMessage(
  messageId: UIMessageId,
  isPNMessage: boolean,
  serviceId: ServiceId,
  tag: string
) {
  // Third party data may change anytime, so we must retrieve them on every request

  yield* put(loadThirdPartyMessage.request({ id: messageId, serviceId, tag }));

  const outputAction = yield* take([
    loadThirdPartyMessage.success,
    loadThirdPartyMessage.failure
  ]);
  if (isActionOf(loadThirdPartyMessage.failure, outputAction)) {
    return undefined;
  }

  const thirdPartyMessagePot = yield* select(
    thirdPartyFromIdSelector,
    messageId
  );

  const thirdPartyMessageOrUndefined = pot.toUndefined(thirdPartyMessagePot);
  yield* call(
    decodeAndTrackThirdPartyMessageDetailsIfNeeded,
    isPNMessage,
    thirdPartyMessageOrUndefined,
    serviceId,
    tag
  );

  return thirdPartyMessageOrUndefined;
}

function* setMessageReadIfNeeded(paginatedMessage: UIMessage) {
  const userHadReadMessage = paginatedMessage.isRead;
  if (!userHadReadMessage) {
    yield* put(
      upsertMessageStatusAttributes.request({
        message: paginatedMessage,
        update: { tag: "reading" }
      })
    );

    const outputAction = yield* take([
      upsertMessageStatusAttributes.success,
      upsertMessageStatusAttributes.failure
    ]);
    if (isActionOf(upsertMessageStatusAttributes.failure, outputAction)) {
      return undefined;
    }
  }

  return true;
}

function* dispatchSuccessAction(
  paginatedMessage: UIMessage,
  messageDetails: UIMessageDetails,
  thirdPartyMessage?: ThirdPartyMessageWithContent
) {
  const isPNMessageCategory = paginatedMessage.category.tag === TagEnum.PN;
  const containsPayment = pipe(
    isPNMessageCategory,
    B.fold(
      () => pipe(messageDetails.paymentData, O.fromNullable, O.isSome),
      constUndefined
    )
  );
  const attachmentCount =
    thirdPartyMessage?.third_party_message.attachments?.length ?? 0;

  const isPnEnabled = yield* select(isPnEnabledSelector);

  yield* put(
    getMessageDataAction.success({
      containsAttachments: attachmentCount > 0,
      containsPayment,
      euCovidCerficateAuthCode: euCovidCertificateEnabled
        ? messageDetails.euCovidCertificate?.authCode
        : undefined,
      firstTimeOpening: !paginatedMessage.isRead,
      hasRemoteContent: !!thirdPartyMessage,
      isPNMessage: isPnEnabled && isPNMessageCategory,
      messageId: paginatedMessage.id,
      organizationName: paginatedMessage.organizationName,
      serviceId: paginatedMessage.serviceId,
      serviceName: paginatedMessage.serviceName
    })
  );
}

const decodeAndTrackThirdPartyMessageDetailsIfNeeded = (
  isPNMessage: boolean,
  thirdPartyMessageOrUndefined: ThirdPartyMessageWithContent | undefined,
  serviceId: ServiceId,
  tag: string
) =>
  pipe(
    thirdPartyMessageOrUndefined,
    O.fromNullable,
    O.filter(_ => !isPNMessage),
    O.chainNullableK(
      thirdPartyMessage => thirdPartyMessage.third_party_message.details
    ),
    O.map(details =>
      pipe(
        details,
        RemoteContentDetails.decode,
        E.mapLeft(errors =>
          pipe(errors, readableReport, reason =>
            trackRemoteContentMessageDecodingWarning(reason, serviceId, tag)
          )
        )
      )
    )
  );

export const testable = isTestEnv
  ? {
      loadMessageData,
      decodeAndTrackThirdPartyMessageDetailsIfNeeded,
      dispatchSuccessAction,
      setMessageReadIfNeeded,
      getPaginatedMessage,
      getService,
      getMessageDetails,
      getThirdPartyDataMessage
    }
  : undefined;
