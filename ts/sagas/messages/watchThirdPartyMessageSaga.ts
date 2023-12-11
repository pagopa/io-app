import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import * as O from "fp-ts/lib/Option";
import { SagaIterator } from "redux-saga";
import { put, takeLatest, call } from "typed-redux-saga/macro";
import { ActionType, getType } from "typesafe-actions";
import { BackendClient } from "../../api/backend";
import { loadThirdPartyMessage } from "../../features/messages/store/actions";
import { toPNMessage } from "../../features/pn/store/types/transformers";
import {
  trackPNNotificationLoadError,
  trackPNNotificationLoadSuccess
} from "../../features/pn/analytics";
import {
  trackRemoteContentLoadFailure,
  trackRemoteContentLoadRequest,
  trackRemoteContentLoadSuccess,
  trackThirdPartyMessageAttachmentCount
} from "../../features/messages/analytics";
import { withRefreshApiCall } from "../../features/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../types/utils";
import { unknownToReason } from "../../features/messages/utils";
import { ThirdPartyMessageWithContent } from "../../../definitions/backend/ThirdPartyMessageWithContent";
import { ServiceId } from "../../../definitions/backend/ServiceId";
import { TagEnum } from "../../../definitions/backend/MessageCategoryPN";

export function* watchThirdPartyMessageSaga(
  client: BackendClient
): SagaIterator {
  yield* takeLatest(
    getType(loadThirdPartyMessage.request),
    getThirdPartyMessage,
    client
  );
}

function* getThirdPartyMessage(
  client: BackendClient,
  action: ActionType<typeof loadThirdPartyMessage.request>
) {
  const { id, serviceId, tag } = action.payload;
  trackRemoteContentLoadRequest(tag);

  const getThirdPartyMessage = client.getThirdPartyMessage();

  try {
    const result = (yield* call(
      withRefreshApiCall,
      getThirdPartyMessage({ id }),
      action
    )) as unknown as SagaCallReturnType<typeof getThirdPartyMessage>;
    if (E.isLeft(result)) {
      const reason = readableReport(result.left);
      throw new Error(reason);
    } else if (result.right.status === 200) {
      const thirdPartyMessage = result.right.value;
      yield* call(trackSuccess, thirdPartyMessage, tag);
      yield* put(
        loadThirdPartyMessage.success({ id, content: thirdPartyMessage })
      );
    } else {
      const reason = `Response status ${result.right.status} - ${
        result.right.value?.detail || "no detail field provided"
      }`;
      throw new Error(reason);
    }
  } catch (error) {
    const reason = unknownToReason(error);
    yield* call(trackFailure, reason, serviceId, tag);
    yield* put(loadThirdPartyMessage.failure({ id, error: new Error(reason) }));
  }
}

const trackSuccess = (
  messageFromApi: ThirdPartyMessageWithContent,
  tag: string
) => {
  trackRemoteContentLoadSuccess(tag);
  if (tag === TagEnum.PN) {
    const pnMessageOption = toPNMessage(messageFromApi);

    if (O.isSome(pnMessageOption)) {
      const pnMessage = pnMessageOption.value;
      trackPNNotificationLoadSuccess(pnMessage);
    } else {
      trackPNNotificationLoadError();
    }
  } else {
    const attachments = messageFromApi.third_party_message.attachments;
    const attachmentCount = attachments?.length ?? 0;
    trackThirdPartyMessageAttachmentCount(attachmentCount);
  }
};

const trackFailure = (reason: string, serviceId: ServiceId, tag: string) => {
  trackRemoteContentLoadFailure(serviceId, tag, reason);

  if (tag === TagEnum.PN) {
    trackPNNotificationLoadError(reason);
  }
};
