import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { isAarInAppDelegationRemoteEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SagaCallReturnType } from "../../../../types/utils";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { unknownToReason } from "../../../messages/utils";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAarFailure
} from "../analytics";
import { SendAarClient } from "../api/client";
import { setAarFlowState } from "../store/actions";
import { currentAarFlowData } from "../store/selectors";
import {
  AarFlowState,
  SendAarFailurePhase,
  sendAarFlowStates
} from "../utils/stateUtils";

const sendAarFailurePhase: SendAarFailurePhase = "Fetch QRCode";

export function* fetchAarQrCodeSaga(
  fetchQRCode: SendAarClient["aarQRCodeCheck"],
  sessionToken: string,
  action: ReturnType<typeof setAarFlowState>
) {
  const currentState = yield* select(currentAarFlowData);
  if (currentState.type !== sendAarFlowStates.fetchingQRData) {
    yield* call(
      trackSendAarFailure,
      sendAarFailurePhase,
      `Called in wrong state (${currentState.type})`,
      undefined
    );
    return;
  }

  const { qrCode } = currentState;
  const isSendUATEnvironment = yield* select(isPnTestEnabledSelector);

  try {
    const fetchQrRequest = fetchQRCode({
      Bearer: `Bearer ${sessionToken}`,
      body: {
        aarQrCodeValue: qrCode
      },
      isTest: isSendUATEnvironment
    });
    const result = (yield* call(
      withRefreshApiCall,
      fetchQrRequest,
      action
    )) as unknown as SagaCallReturnType<typeof fetchQRCode>;

    if (E.isLeft(result)) {
      throw new Error(
        `Decoding failure (${readableReportSimplified(result.left)})`
      );
    }

    const { status, value } = result.right;
    switch (status) {
      case 200:
        const { iun, recipientInfo, mandateId } = value;
        const nextState: AarFlowState = {
          type: sendAarFlowStates.fetchingNotificationData,
          iun,
          recipientInfo: { ...recipientInfo },
          mandateId
        };
        yield* put(setAarFlowState(nextState));
        return;

      case 401:
        yield* call(
          trackSendAarFailure,
          sendAarFailurePhase,
          "Fast login expiration",
          undefined
        );
        return;

      case 403:
        const isDelegationEnabled = yield* select(
          isAarInAppDelegationRemoteEnabledSelector
        );
        const stateToPut = isDelegationEnabled
          ? sendAarFlowStates.notAddressee
          : sendAarFlowStates.notAddresseeFinal;
        const notAddresseeState: AarFlowState = {
          type: stateToPut,
          iun: value.iun,
          recipientInfo: { ...value.recipientInfo },
          qrCode
        };
        yield* put(setAarFlowState(notAddresseeState));
        return;

      default:
        const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
          status,
          value
        )})`;
        yield* call(trackSendAarFailure, sendAarFailurePhase, reason, value);
        const errorState: AarFlowState = {
          type: sendAarFlowStates.ko,
          previousState: { ...currentState },
          ...(value !== undefined && { error: value }),
          debugData: {
            phase: sendAarFailurePhase,
            reason
          }
        };
        yield* put(setAarFlowState(errorState));
        return;
    }
  } catch (e) {
    const reason = `An error was thrown (${unknownToReason(e)})`;
    yield* call(trackSendAarFailure, sendAarFailurePhase, reason, undefined);
    yield* put(
      setAarFlowState({
        type: sendAarFlowStates.ko,
        previousState: { ...currentState },
        debugData: {
          phase: sendAarFailurePhase,
          reason
        }
      })
    );
  }
}
