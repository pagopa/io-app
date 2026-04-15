import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
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
import { getAarErrorBehaviour } from "../utils/aarErrorMappings";
import {
  AarFlowState,
  SendAarFailurePhase,
  sendAarFlowStates
} from "../utils/stateUtils";

const sendAarFailurePhase: SendAarFailurePhase = "Validate Mandate";

export type AcceptMandateSuccessfulResponse = Extract<
  Awaited<ReturnType<SendAarClient["acceptAARMandate"]>>,
  { _tag: "Right" }
>;

export function* validateMandateSaga(
  acceptMandate: SendAarClient["acceptAARMandate"],
  sessionToken: string,
  action: ReturnType<typeof setAarFlowState>
) {
  if (action.payload.type !== sendAarFlowStates.validatingMandate) {
    yield* call(
      trackSendAarFailure,
      sendAarFailurePhase,
      `Called in wrong state (${action.payload.type})`,
      undefined
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
  } = action.payload;
  const isSendUATEnvironment = yield* select(isPnTestEnabledSelector);

  try {
    const acceptMandateRequest = acceptMandate({
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
    )) as SagaCallReturnType<typeof acceptMandate>;

    if (E.isLeft(result)) {
      throw new Error(
        `Decoding failure (${readableReportSimplified(result.left)})`
      );
    }

    const { status, value } = result.right;
    switch (status) {
      case 204:
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
      default:
        const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
          status,
          value
        )})`;
        yield* call(trackSendAarFailure, sendAarFailurePhase, reason, value);
        const { track } = getAarErrorBehaviour(value);
        track(reason);
        const errorState: AarFlowState = {
          type: sendAarFlowStates.ko,
          previousState: { ...action.payload },
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
        previousState: { ...action.payload },
        debugData: {
          phase: sendAarFailurePhase,
          reason
        }
      })
    );
  }
}
