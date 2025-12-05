import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { SagaCallReturnType } from "../../../../types/utils";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { unknownToReason } from "../../../messages/utils";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure
} from "../analytics";
import { SendAARClient } from "../api/client";
import { setAarFlowState } from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import {
  AARFlowState,
  SendAARFailurePhase,
  sendAARFlowStates
} from "../utils/stateUtils";

const sendAARFailurePhase: SendAARFailurePhase = "Validate Mandate";

export function* validateMandateSaga(
  acceptIOMandate: SendAARClient["acceptIOMandate"],
  sessionToken: SessionToken,
  action: ReturnType<typeof setAarFlowState>
) {
  const currentState = yield* select(currentAARFlowData);
  if (currentState.type !== sendAARFlowStates.validatingMandate) {
    yield* call(
      trackSendAARFailure,
      sendAARFailurePhase,
      `Called in wrong state (${currentState.type})`
    );
    return;
  }

  const {
    signedVerificationCode,
    nisData,
    mrtdData,
    mandateId,
    iun,
    recipientInfo
  } = currentState;
  const isSendUATEnvironment = yield* select(isPnTestEnabledSelector);

  try {
    const acceptMandateRequest = acceptIOMandate({
      Bearer: `Bearer ${sessionToken}`,
      body: {
        nisData: {
          nis: nisData.nis,
          pub_key: nisData.publicKey,
          sod: nisData.sod
        },
        signedNonce: signedVerificationCode,
        mrtdData
      },
      isTest: isSendUATEnvironment,
      mandateId
    });
    const result = (yield* call(
      withRefreshApiCall,
      acceptMandateRequest,
      action
    )) as unknown as SagaCallReturnType<typeof acceptIOMandate>;

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
      case 204:
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
      // TODO: [IOCOM-2844] Map 400 and 422 errors
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
