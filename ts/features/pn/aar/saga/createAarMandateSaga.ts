import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import * as E from "fp-ts/Either";
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

const sendAarFailurePhase: SendAarFailurePhase = "Create Mandate";
export function* createAarMandateSaga(
  createAarMandate: SendAarClient["createAARMandate"],
  sessionToken: string,
  action: ReturnType<typeof setAarFlowState>
) {
  const currentState = action.payload;
  if (currentState.type !== "creatingMandate") {
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
        const { verificationCode, mandateId } = value.mandate;
        if (mandateId === undefined || verificationCode === undefined) {
          throw Error(`invalid mandateId or verification code`);
        }

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
          trackSendAarFailure,
          sendAarFailurePhase,
          "Fast login expiration",
          undefined
        );
        break;
      default:
        const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
          status,
          value
        )})`;

        yield* call(trackSendAarFailure, sendAarFailurePhase, reason, value);
        const { track } = yield* call(getAarErrorBehaviour, value);
        yield* call(track, reason);

        const errorState: AarFlowState = {
          type: sendAarFlowStates.ko,
          previousState: currentState,
          ...(value !== undefined && { error: value }),
          debugData: {
            phase: sendAarFailurePhase,
            reason
          }
        };
        yield* put(setAarFlowState(errorState));
        return;
    }
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
