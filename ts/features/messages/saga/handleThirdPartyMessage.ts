import { readableReport } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { loadThirdPartyMessage } from "../store/actions";
import {
  trackPNNotificationLoadError,
  trackPNNotificationLoadSuccess
} from "../../pn/analytics";
import {
  trackRemoteContentLoadFailure,
  trackRemoteContentLoadRequest,
  trackRemoteContentLoadSuccess,
  trackThirdPartyMessageAttachmentCount,
  trackUndefinedBearerToken,
  UndefinedBearerTokenPhase
} from "../analytics";
import { withRefreshApiCall } from "../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../types/utils";
import { unknownToReason } from "../utils";
import { ThirdPartyMessageWithContent } from "../../../../definitions/backend/ThirdPartyMessageWithContent";
import { TagEnum } from "../../../../definitions/backend/MessageCategoryPN";
import { serviceDetailsByIdSelector } from "../../services/details/store/selectors";
import { ServiceDetails } from "../../../../definitions/services/ServiceDetails";
import { thirdPartyKind } from "../types/thirdPartyById";
import { backendClientManager } from "../../../api/BackendClientManager";
import { apiUrlPrefix } from "../../../config";
import { sessionTokenSelector } from "../../authentication/common/store/selectors";
import { isTestEnv } from "../../../utils/environment";
import { getKeyInfo } from "../../lollipop/saga";
import { ThirdPartyMessage } from "../../../../definitions/pn/ThirdPartyMessage";

export function* handleThirdPartyMessage(
  action: ActionType<typeof loadThirdPartyMessage.request>
) {
  const { id, serviceId, tag } = action.payload;

  const sessionToken = yield* select(sessionTokenSelector);

  if (!sessionToken) {
    trackUndefinedBearerToken(
      UndefinedBearerTokenPhase.thirdPartyMessageLoading
    );
    return;
  }

  const keyInfo = yield* call(getKeyInfo);

  const { getThirdPartyMessage } = backendClientManager.getBackendClient(
    apiUrlPrefix,
    sessionToken,
    keyInfo
  );

  // This method is called by `handleLoadMessageData` saga, which makes
  // sure that the service details are properly retrieved and loaded
  // into the redux store before requesting a third-party-message
  const serviceDetails = yield* select(serviceDetailsByIdSelector, serviceId);
  trackRemoteContentLoadRequest(
    serviceId,
    serviceDetails?.name,
    serviceDetails?.organization.name,
    serviceDetails?.organization.fiscal_code,
    tag
  );

  const getThirdPartyMessageRequest = getThirdPartyMessage();

  try {
    const result = (yield* call(
      withRefreshApiCall,
      getThirdPartyMessageRequest({ id }),
      action
    )) as unknown as SagaCallReturnType<typeof getThirdPartyMessageRequest>;
    if (E.isLeft(result)) {
      const reason = readableReport(result.left);
      throw new Error(reason);
    } else if (result.right.status === 200) {
      const thirdPartyMessage = result.right.value;
      yield* call(trackSuccess, thirdPartyMessage, serviceDetails, tag);
      yield* put(
        loadThirdPartyMessage.success({
          id,
          content: {
            kind: thirdPartyKind.TPM,
            ...thirdPartyMessage
          }
        })
      );
    } else {
      const reason = `Response status ${result.right.status} - ${
        result.right.value?.detail || "no detail field provided"
      }`;
      throw new Error(reason);
    }
  } catch (error) {
    const reason = unknownToReason(error);
    yield* call(trackFailure, reason, serviceDetails, tag);
    yield* put(loadThirdPartyMessage.failure({ id, error: new Error(reason) }));
  }
}

const trackSuccess = (
  messageFromApi: ThirdPartyMessageWithContent,
  serviceDetails: ServiceDetails | undefined,
  tag: string
) => {
  trackRemoteContentLoadSuccess(
    serviceDetails?.id,
    serviceDetails?.name,
    serviceDetails?.organization.name,
    serviceDetails?.organization.fiscal_code,
    tag
  );
  if (tag === TagEnum.PN) {
    const sendThirdPartyMessageEither = ThirdPartyMessage.decode(
      messageFromApi.third_party_message
    );
    if (
      E.isRight(sendThirdPartyMessageEither) &&
      sendThirdPartyMessageEither.right.details != null
    ) {
      const attachments = sendThirdPartyMessageEither.right.attachments;
      const hasAttachments = attachments != null && attachments.length > 0;

      const details = sendThirdPartyMessageEither.right.details;
      const timeline = details.notificationStatusHistory;

      const status =
        timeline.length > 0 ? timeline[timeline.length - 1].status : undefined;

      trackPNNotificationLoadSuccess(
        hasAttachments,
        status,
        "message",
        "not_set"
      );
    } else {
      trackPNNotificationLoadError(
        "Unable convert the third party message to SEND message structure"
      );
    }
  } else {
    const attachments = messageFromApi.third_party_message.attachments;
    const attachmentCount = attachments?.length ?? 0;
    trackThirdPartyMessageAttachmentCount(attachmentCount);
  }
};

const trackFailure = (
  reason: string,
  serviceDetails: ServiceDetails | undefined,
  tag: string
) => {
  trackRemoteContentLoadFailure(
    serviceDetails?.id,
    serviceDetails?.name,
    serviceDetails?.organization.name,
    serviceDetails?.organization.fiscal_code,
    tag,
    reason
  );

  if (tag === TagEnum.PN) {
    trackPNNotificationLoadError(reason);
  }
};

export const testable = isTestEnv ? { trackSuccess, trackFailure } : undefined;
