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
  trackSendAARFailure,
  trackSendAarMandateCieExpiredError,
  trackSendAarMandateCieNotRelatedToDelegatorError
} from "../analytics";
import { SendAARClient } from "../api/client";
import { setAarFlowState } from "../store/actions";
import {
  AARFlowState,
  SendAARFailurePhase,
  sendAARFlowStates
} from "../utils/stateUtils";
import { isDevEnv } from "../../../../utils/environment";

const sendAARFailurePhase: SendAARFailurePhase = "Validate Mandate";

export type AcceptMandateSuccessfulResponse = Extract<
  Awaited<ReturnType<SendAARClient["acceptAARMandate"]>>,
  { _tag: "Right" }
>;

export function* validateMandateSaga(
  acceptMandate: SendAARClient["acceptAARMandate"],
  sessionToken: SessionToken,
  action: ReturnType<typeof setAarFlowState>
) {
  if (action.payload.type !== sendAARFlowStates.validatingMandate) {
    yield* call(
      trackSendAARFailure,
      sendAARFailurePhase,
      `Called in wrong state (${action.payload.type})`
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
      default:
        const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
          status,
          value
        )})`;
        yield* call(handleMixPanelCustomTrackingIfNeeded, status, value);
        yield* call(trackSendAARFailure, sendAARFailurePhase, reason);
        const errorState: AARFlowState = {
          type: sendAARFlowStates.ko,
          previousState: { ...action.payload },
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
        previousState: { ...action.payload },
        debugData: {
          phase: sendAARFailurePhase,
          reason
        }
      })
    );
  }
}

function handleMixPanelCustomTrackingIfNeeded<
  S extends Exclude<
    AcceptMandateSuccessfulResponse["right"]["status"],
    204 | 401
  >
>(
  status: S,
  value: Extract<
    AcceptMandateSuccessfulResponse["right"],
    { status: S }
  >["value"]
) {
  switch (status) {
    case 422:
      {
        const maybeErrorKey = value.errors
          ?.map(({ code }) => code)
          .find(code =>
            /CIE_EXPIRED_ERROR|CIE_NOT_RELATED_TO_DELEGATOR_ERROR/i.test(code)
          );

        if (/CIE_EXPIRED_ERROR/i.test(`${maybeErrorKey}`)) {
          trackSendAarMandateCieExpiredError();
        }
        if (/CIE_NOT_RELATED_TO_DELEGATOR_ERROR/i.test(`${maybeErrorKey}`)) {
          trackSendAarMandateCieNotRelatedToDelegatorError();
        }
      }
      break;
    default:
      break;
  }
}

export const testable = isDevEnv
  ? { handleMixPanelCustomTrackingIfNeeded }
  : undefined;
