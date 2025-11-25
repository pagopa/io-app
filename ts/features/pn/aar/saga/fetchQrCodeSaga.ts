import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { SendAARClient } from "../api/client";
import { setAarFlowState } from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import {
  AARFlowState,
  AAR_DELEGATION_FEATURE_ENABLED,
  SendAARFailurePhase,
  sendAARFlowStates
} from "../utils/stateUtils";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure
} from "../analytics";
import { unknownToReason } from "../../../messages/utils";

const sendAARFailurePhase: SendAARFailurePhase = "Fetch QRCode";

export function* fetchAARQrCodeSaga(
  fetchQRCode: SendAARClient["aarQRCodeCheck"],
  sessionToken: SessionToken,
  action: ReturnType<typeof setAarFlowState>
) {
  const currentState = yield* select(currentAARFlowData);
  if (currentState.type !== sendAARFlowStates.fetchingQRData) {
    yield* call(
      trackSendAARFailure,
      sendAARFailurePhase,
      `Called in wrong state (${currentState.type})`
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
      const reason = `Decoding failure (${readableReportSimplified(
        result.left
      )})`;
      yield* call(trackSendAARFailure, sendAARFailurePhase, reason);
      yield* put(
        setAarFlowState({
          type: sendAARFlowStates.ko,
          previousState: { ...currentState },
          debugData: {
            phase: sendAARFailurePhase,
            reason
          }
        })
      );
      return;
    }

    const { status, value } = result.right;
    switch (status) {
      case 200:
        const { iun, recipientInfo, mandateId } = value;
        const nextState: AARFlowState = {
          type: sendAARFlowStates.fetchingNotificationData,
          iun,
          recipientInfo: { ...recipientInfo },
          mandateId
        };
        yield* put(setAarFlowState(nextState));
        return;

      case 401:
        yield* call(
          trackSendAARFailure,
          sendAARFailurePhase,
          "Fast login expiration"
        );
        return;

      case 403:
        const stateToPut = AAR_DELEGATION_FEATURE_ENABLED
          ? sendAARFlowStates.notAddressee
          : sendAARFlowStates.notAddresseeFinal;
        const notAddresseeState: AARFlowState = {
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
        yield* call(trackSendAARFailure, sendAARFailurePhase, reason);
        const errorState: AARFlowState = {
          type: sendAARFlowStates.ko,
          previousState: { ...currentState },
          ...(value !== undefined && { error: value }),
          debugData: {
            phase: sendAARFailurePhase,
            reason
          }
        };
        yield* put(setAarFlowState(errorState));
        return;
    }
  } catch (e) {
    const reason = `An error was thrown (${unknownToReason(e)})`;
    yield* call(trackSendAARFailure, sendAARFailurePhase, reason);
    yield* put(
      setAarFlowState({
        type: sendAARFlowStates.ko,
        previousState: { ...currentState },
        debugData: {
          phase: sendAARFailurePhase,
          reason
        }
      })
    );
  }
}
