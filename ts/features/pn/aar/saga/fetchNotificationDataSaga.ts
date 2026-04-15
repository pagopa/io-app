import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";

import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../definitions/backend/MessageSubject";
import { ThirdPartyMessage } from "../../../../../definitions/pn/aar/ThirdPartyMessage";
import { pnMessagingServiceIdSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { ReduxSagaEffect, SagaCallReturnType } from "../../../../types/utils";
import { isTestEnv } from "../../../../utils/environment";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { unknownToReason } from "../../../messages/utils";
import { SendUserType } from "../../../pushNotifications/analytics";
import { getServiceDetails } from "../../../services/common/saga/getServiceDetails";
import { profileFiscalCodeSelector } from "../../../settings/common/store/selectors";
import { trackPNNotificationLoadSuccess } from "../../analytics";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAarFailure
} from "../analytics";
import { SendAarClient } from "../api/client";
import {
  EphemeralAarMessageDataActionPayload,
  populateStoresWithEphemeralAarMessageData,
  setAarFlowState
} from "../store/actions";
import { currentAarFlowData } from "../store/selectors";
import { SendAarFailurePhase, sendAarFlowStates } from "../utils/stateUtils";

const sendAarFailurePhase: SendAarFailurePhase = "Fetch Notification";

export function* fetchAarDataSaga(
  fetchData: SendAarClient["getAARNotification"],
  sessionToken: string,
  action: ReturnType<typeof setAarFlowState>
) {
  const currentState = yield* select(currentAarFlowData);
  if (currentState.type !== sendAarFlowStates.fetchingNotificationData) {
    yield* call(
      trackSendAarFailure,
      sendAarFailurePhase,
      `Called in wrong state (${currentState.type})`,
      undefined
    );
    return;
  }
  const isSendUATEnvironment = yield* select(isPnTestEnabledSelector);
  try {
    const fetchAarRequest = fetchData({
      Bearer: `Bearer ${sessionToken}`,
      iun: currentState.iun,
      mandateId: currentState.mandateId,
      "x-pagopa-pn-io-src": "QR_CODE",
      isTest: isSendUATEnvironment
    });
    const result = (yield* call(
      withRefreshApiCall,
      fetchAarRequest,
      action
    )) as unknown as SagaCallReturnType<typeof fetchData>;

    if (E.isLeft(result)) {
      throw new Error(
        `Decoding failure (${readableReportSimplified(result.left)})`
      );
    }

    const { status, value } = result.right;
    if (status === 401) {
      yield* call(
        trackSendAarFailure,
        sendAarFailurePhase,
        "Fast login expiration",
        undefined
      );
      return;
    }
    if (status !== 200) {
      const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
        status,
        value
      )})`;
      yield* call(trackSendAarFailure, sendAarFailurePhase, reason, value);
      yield* put(
        setAarFlowState({
          type: sendAarFlowStates.ko,
          previousState: currentState,
          error: value,
          debugData: {
            phase: sendAarFailurePhase,
            reason
          }
        })
      );
      return;
    }

    const payloadEither = yield* call(
      aarMessageDataPayloadFromResponse,
      value,
      currentState.mandateId
    );
    if (E.isLeft(payloadEither)) {
      throw Error(payloadEither.left);
    }

    const payload = payloadEither.right;
    yield* put(populateStoresWithEphemeralAarMessageData(payload));
    yield* put(
      setAarFlowState({
        type: sendAarFlowStates.displayingNotificationData,
        notification: value,
        recipientInfo: { ...currentState.recipientInfo },
        mandateId: currentState.mandateId,
        iun: currentState.iun,
        pnServiceId: payload.pnServiceID
      })
    );
  } catch (e: unknown) {
    const reason = `An error was thrown (${unknownToReason(e)})`;
    yield* call(trackSendAarFailure, sendAarFailurePhase, reason, undefined);
    yield* put(
      setAarFlowState({
        type: sendAarFlowStates.ko,
        previousState: currentState,
        debugData: {
          phase: sendAarFailurePhase,
          reason
        }
      })
    );
  }
}

function* aarMessageDataPayloadFromResponse(
  sendMessage: ThirdPartyMessage,
  mandateId: string | undefined
): Generator<
  ReduxSagaEffect,
  E.Either<string, EphemeralAarMessageDataActionPayload>
> {
  const sendUserType: SendUserType =
    mandateId != null ? "mandatory" : "recipient";

  const details = sendMessage.details;
  if (details == null) {
    return E.left(`Field 'details' in the AAR Notification is missing`);
  }

  // Notification data has been properly retrieved
  const hasAttachments =
    sendMessage.attachments != null && sendMessage.attachments.length > 0;
  const timelineOrUndefined = sendMessage.details?.notificationStatusHistory;
  const lastTimelineStatus =
    timelineOrUndefined != null && timelineOrUndefined.length > 0
      ? timelineOrUndefined[timelineOrUndefined.length - 1].status
      : undefined;
  yield* call(
    trackPNNotificationLoadSuccess,
    hasAttachments,
    lastTimelineStatus,
    "aar",
    sendUserType
  );

  // Service details (will be displayed in the SEND notification screen)
  const sendServiceID = yield* select(pnMessagingServiceIdSelector);
  if (sendServiceID === undefined) {
    return E.left(`Unable to retrieve sendServiceId`);
  }

  const sendServiceDetails = yield* call(getServiceDetails, sendServiceID);
  if (sendServiceDetails === undefined) {
    return E.left(`Unable to retrieve SEND service details`);
  }

  const fiscalCode = yield* select(profileFiscalCodeSelector);
  if (fiscalCode === undefined) {
    return E.left(`Unable to retrieve user fiscal code`);
  }

  const aarFlowState: EphemeralAarMessageDataActionPayload = {
    iun: details.iun as NonEmptyString,
    thirdPartyMessage: sendMessage,
    fiscalCode,
    pnServiceID: sendServiceID,
    markdown: "*".repeat(81) as MessageBodyMarkdown,
    subject: details.subject as MessageSubject,
    mandateId
  };
  return E.right(aarFlowState);
}

export const testable = isTestEnv
  ? { aarMessageDataPayloadFromResponse }
  : undefined;
