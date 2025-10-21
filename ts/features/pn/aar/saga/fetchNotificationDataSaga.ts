import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { MessageBodyMarkdown } from "../../../../../definitions/backend/MessageBodyMarkdown";
import { MessageSubject } from "../../../../../definitions/backend/MessageSubject";
import { pnMessagingServiceIdSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { SagaCallReturnType } from "../../../../types/utils";
import { isTestEnv } from "../../../../utils/environment";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { getServiceDetails } from "../../../services/common/saga/ getServiceDetails";
import { profileFiscalCodeSelector } from "../../../settings/common/store/selectors";
import { SendAARClient } from "../api/client";
import {
  populateStoresWithEphemeralAarMessageData,
  setAarFlowState
} from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import { sendAARFlowStates } from "../utils/stateUtils";
import { trackPNNotificationLoadSuccess } from "../../analytics";
import { SendUserType } from "../../../pushNotifications/analytics";
import { ThirdPartyMessage } from "../../../../../definitions/pn/aar/ThirdPartyMessage";

export function* fetchAarDataSaga(
  fetchData: SendAARClient["getAARNotification"],
  sessionToken: SessionToken
) {
  const currentState = yield* select(currentAARFlowData);
  const isTest = yield* select(isPnTestEnabledSelector);
  if (currentState.type !== sendAARFlowStates.fetchingNotificationData) {
    return;
  }
  try {
    const fetchAarRequest = fetchData({
      Bearer: `Bearer ${sessionToken}`,
      iun: currentState.iun,
      mandateId: currentState.mandateId,
      "x-pagopa-pn-io-src": "QRCODE",
      isTest
    });
    const result = (yield* call(
      withRefreshApiCall,
      fetchAarRequest
    )) as unknown as SagaCallReturnType<typeof fetchData>;

    if (E.isLeft(result)) {
      yield* put(
        setAarFlowState({
          type: sendAARFlowStates.ko,
          previousState: currentState
        })
      );
      return;
    }
    const { status, value } = result.right;
    if (status !== 200) {
      yield* put(
        setAarFlowState({
          type: sendAARFlowStates.ko,
          previousState: currentState,
          error: value
        })
      );
      return;
    }

    const payload = yield* call(
      aarMessageDataPayloadFromResponse,
      value,
      currentState.mandateId
    );

    if (payload === undefined) {
      throw new Error(
        "unable to compute placeholder AAR payload from response"
      );
    }

    yield* put(populateStoresWithEphemeralAarMessageData(payload));
    yield* put(
      setAarFlowState({
        type: sendAARFlowStates.displayingNotificationData,
        notification: value,
        recipientInfo: { ...currentState.recipientInfo },
        mandateId: currentState.mandateId,
        iun: currentState.iun,
        pnServiceId: payload.pnServiceID
      })
    );
  } catch (e: unknown) {
    yield* put(
      setAarFlowState({
        type: sendAARFlowStates.ko,
        previousState: currentState
      })
    );
  }
}

function* aarMessageDataPayloadFromResponse(
  sendMessage: ThirdPartyMessage,
  mandateId: string | undefined
) {
  const sendUserType: SendUserType =
    mandateId != null ? "mandatory" : "recipient";

  const details = sendMessage.details;
  if (details == null) {
    return undefined;
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
  const pnServiceID = yield* select(pnMessagingServiceIdSelector);
  if (pnServiceID === undefined) {
    return undefined;
  }

  const pnServiceDetails = yield* call(getServiceDetails, pnServiceID);
  if (pnServiceDetails === undefined) {
    return undefined;
  }

  const fiscalCode = yield* select(profileFiscalCodeSelector);
  if (fiscalCode === undefined) {
    return undefined;
  }

  return {
    iun: details.iun as NonEmptyString,
    thirdPartyMessage: sendMessage,
    fiscalCode,
    pnServiceID,
    markdown: "*".repeat(81) as MessageBodyMarkdown,
    subject: details.subject as MessageSubject,
    mandateId
  };
}

export const testable = isTestEnv
  ? { aarMessageDataPayloadFromResponse }
  : undefined;
