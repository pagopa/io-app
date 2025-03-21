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
  loadMessageById,
  loadMessageDetails,
  loadThirdPartyMessage,
  upsertMessageStatusAttributes
} from "../store/actions";
import { getPaginatedMessageById } from "../store/reducers/paginatedById";
import { UIMessage, UIMessageDetails, UIMessageId } from "../types";
import { serviceByIdPotSelector } from "../../services/details/store/reducers";
import { loadServiceDetail } from "../../services/details/store/actions/details";
import { messageDetailsByIdSelector } from "../store/reducers/detailsById";
import { thirdPartyFromIdSelector } from "../store/reducers/thirdPartyById";
import { isLoadingOrUpdatingInbox } from "../store/reducers/allPaginated";
import { TagEnum } from "../../../../definitions/backend/MessageCategoryPN";
import { isPnEnabledSelector } from "../../../store/reducers/backendStatus/remoteConfig";
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
import { MessageGetStatusFailurePhaseType } from "../store/reducers/messageGetStatus";
import { ServicePublic } from "../../../../definitions/backend/ServicePublic";
import { ctaFromMessageCTA, unsafeMessageCTAFromInput } from "../utils/ctas";
import { extractContentFromMessageSources } from "../utils";
import { isFIMSLink } from "../../fims/singleSignOn/utils";

export function* handleLoadMessageData(
  action: ActionType<typeof getMessageDataAction.request>
) {
  yield* race({
    polling: call(loadMessageData, action.payload),
    cancelAction: take(cancelGetMessageDataAction)
  });
}

// eslint-disable-next-line sonarjs/cognitive-complexity
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
    yield* call(
      commonFailureHandling,
      "paginatedMessage",
      fromPushNotification
    );
    return;
  }

  // Make sure that we have the service details
  const serviceId = paginatedMessage.serviceId;
  const serviceDetails = yield* call(getServiceDetails, serviceId);
  if (!serviceDetails) {
    yield* call(commonFailureHandling, "serviceDetails", fromPushNotification);
    return;
  }

  // Make sure that we have the message details
  const messageDetails = yield* call(getMessageDetails, messageId);
  if (!messageDetails) {
    yield* call(commonFailureHandling, "messageDetails", fromPushNotification);
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
    if (isPNMessage) {
      trackPNPushOpened();
    }
    yield* call(
      commonFailureHandling,
      "preconditions",
      fromPushNotification,
      true
    );
    return;
  }

  // Make sure to download the third party data if the message has them
  // (PN is always a third party message so in that case make sure to
  // download it regardless of what is in messageDetails)
  const shouldDownloadThirdPartyData =
    messageDetails.hasThirdPartyData || isPNMessage;
  const thirdPartyMessageDetails = shouldDownloadThirdPartyData
    ? yield* call(
        getThirdPartyDataMessage,
        messageId,
        isPNMessage,
        serviceDetails,
        paginatedMessage.category.tag
      )
    : undefined;
  if (shouldDownloadThirdPartyData && !thirdPartyMessageDetails) {
    yield* call(
      commonFailureHandling,
      "thirdPartyMessageDetails",
      fromPushNotification
    );
    return;
  }

  const messageReadCheckSucceded = yield* call(
    setMessageReadIfNeeded,
    paginatedMessage
  );
  if (!messageReadCheckSucceded) {
    yield* call(
      commonFailureHandling,
      "readStatusUpdate",
      fromPushNotification
    );
    return;
  }

  trackMessageDataLoadSuccess(fromPushNotification);
  yield* call(
    dispatchSuccessAction,
    paginatedMessage,
    messageDetails,
    thirdPartyMessageDetails
  );
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

function* getServiceDetails(serviceId: ServiceId) {
  const initialServicePot = yield* select(serviceByIdPotSelector, serviceId);
  if (!pot.isSome(initialServicePot) || pot.isError(initialServicePot)) {
    yield* put(loadServiceDetail.request(serviceId));

    const outputAction = yield* take([
      loadServiceDetail.success,
      loadServiceDetail.failure
    ]);
    if (isActionOf(loadServiceDetail.failure, outputAction)) {
      return undefined;
    }

    const finalServicePot = yield* select(serviceByIdPotSelector, serviceId);
    return pot.toUndefined(finalServicePot);
  }

  return pot.toUndefined(initialServicePot);
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
  service: ServicePublic,
  tag: string
) {
  // Third party data may change anytime, so we must retrieve them on every request

  yield* put(
    loadThirdPartyMessage.request({
      id: messageId,
      serviceId: service.service_id,
      tag
    })
  );

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
    service,
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
  thirdPartyMessage: ThirdPartyMessageWithContent | undefined
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

  const hasFIMSCTA = computeHasFIMSCTA(messageDetails, thirdPartyMessage);

  yield* put(
    getMessageDataAction.success({
      containsAttachments: attachmentCount > 0,
      containsPayment,
      firstTimeOpening: !paginatedMessage.isRead,
      hasFIMSCTA,
      hasRemoteContent: !!thirdPartyMessage,
      isLegacyGreenPass: !!messageDetails.euCovidCertificate?.authCode,
      isPNMessage: isPnEnabled && isPNMessageCategory,
      messageId: paginatedMessage.id,
      organizationFiscalCode: paginatedMessage.organizationFiscalCode,
      organizationName: paginatedMessage.organizationName,
      serviceId: paginatedMessage.serviceId,
      serviceName: paginatedMessage.serviceName
    })
  );
}

function* commonFailureHandling(
  phase: MessageGetStatusFailurePhaseType,
  loadingStartedFromPushNotification: boolean,
  blockedFromPushNotificationOpt: boolean | undefined = undefined
) {
  yield* call(
    trackMessageDataLoadFailure,
    loadingStartedFromPushNotification,
    phase
  );
  yield* put(
    getMessageDataAction.failure({ blockedFromPushNotificationOpt, phase })
  );
}

const decodeAndTrackThirdPartyMessageDetailsIfNeeded = (
  isPNMessage: boolean,
  thirdPartyMessageOrUndefined: ThirdPartyMessageWithContent | undefined,
  service: ServicePublic,
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
            trackRemoteContentMessageDecodingWarning(
              service.service_id,
              service.service_name,
              service.organization_name,
              service.organization_fiscal_code,
              tag,
              reason
            )
          )
        )
      )
    )
  );

const computeHasFIMSCTA = (
  messageDetails: UIMessageDetails,
  thirdPartyMessage: ThirdPartyMessageWithContent | undefined
) => {
  const markdownWithCTAs = extractContentFromMessageSources(
    (messageContent: RemoteContentDetails | UIMessageDetails) =>
      messageContent.markdown,
    messageDetails,
    thirdPartyMessage
  );
  const unsafeMessageCTA = unsafeMessageCTAFromInput(markdownWithCTAs);
  const cta = ctaFromMessageCTA(unsafeMessageCTA);
  if (cta != null && isFIMSLink(cta.cta_1.action)) {
    return true;
  }
  if (cta?.cta_2 != null && isFIMSLink(cta.cta_2.action)) {
    return true;
  }
  return false;
};

export const testable = isTestEnv
  ? {
      commonFailureHandling,
      computeHasFIMSCTA,
      decodeAndTrackThirdPartyMessageDetailsIfNeeded,
      dispatchSuccessAction,
      getMessageDetails,
      getPaginatedMessage,
      getServiceDetails,
      getThirdPartyDataMessage,
      loadMessageData,
      setMessageReadIfNeeded
    }
  : undefined;
