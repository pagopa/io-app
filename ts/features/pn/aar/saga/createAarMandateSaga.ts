import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import * as E from "fp-ts/Either";
import { type } from "io-ts";
import { call, put, select } from "typed-redux-saga/macro";
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
import { SendAARFailurePhase, sendAARFlowStates } from "../utils/stateUtils";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";

const sendAarFailurePhase: SendAARFailurePhase = "Create Mandate";
export function* createAarMandateSaga(
  createAarMandate: SendAARClient["createAARMandate"],
  sessionToken: SessionToken,
  action: ReturnType<typeof setAarFlowState>
) {
  const currentState = yield* select(currentAARFlowData);
  if (currentState.type !== "creatingMandate") {
    yield* call(
      trackSendAARFailure,
      sendAarFailurePhase,
      `Called in wrong state (${currentState.type})`
    );
    return;
  }
  const isSendUATEnvironment = yield* select(isPnTestEnabledSelector);
  try {
    const createMandateRequest = createAarMandate({
      Bearer: `Bearer ${sessionToken}`,
      body: {
        aarQrCodeValue: currentState.qrCode
      },
      isTest: isSendUATEnvironment
    });
    const result = (yield* call(
      withRefreshApiCall,
      createMandateRequest,
      action
    )) as SagaCallReturnType<typeof createAarMandate>;

    if (E.isLeft(result)) {
      throw new Error(
        `Decoding failure (${readableReportSimplified(result.left)})`
      );
    }
    const { status, value } = result.right;

    switch (status) {
      case 201:
        if (!mandateType.is(value.mandate)) {
          throw Error("Mandate decoding failure");
        }
        const { verificationCode, mandateId } = value.mandate;

        yield* put(
          setAarFlowState({
            type: "cieCanAdvisory",
            iun: currentState.iun,
            recipientInfo: currentState.recipientInfo,
            mandateId,
            verificationCode
          })
        );
        break;
      case 401:
        yield* call(
          trackSendAARFailure,
          sendAarFailurePhase,
          "Fast login expiration"
        );
        break;
      default:
        const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
          status,
          value
        )})`;
        throw new Error(reason);
    }
  } catch (e: unknown) {
    const reason = `An error was thrown (${unknownToReason(e)})`;
    yield* call(trackSendAARFailure, sendAarFailurePhase, reason);
    yield* put(
      setAarFlowState({
        type: sendAARFlowStates.ko,
        previousState: currentState,
        debugData: {
          phase: sendAarFailurePhase,
          reason
        }
      })
    );
  }
}

const mandateType = type({
  verificationCode: NonEmptyString,
  mandateId: NonEmptyString
});
