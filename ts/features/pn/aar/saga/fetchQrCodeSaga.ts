import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { SendAARClient } from "../api/client";
import { setAarFlowState } from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import {
  AARFlowState,
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
  sessionToken: SessionToken
) {
  const currentState = yield* select(currentAARFlowData);

  if (currentState.type !== sendAARFlowStates.fetchingQRData) {
    trackSendAARFailure(
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
      fetchQrRequest
    )) as unknown as SagaCallReturnType<typeof fetchQRCode>;

    const resultAction = pipe(
      result,
      E.fold(
        error => {
          const reason = `Decoding failure (${readableReportSimplified(
            error
          )})`;
          trackSendAARFailure(sendAARFailurePhase, reason);
          return setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: { ...currentState },
            debugData: {
              phase: sendAARFailurePhase,
              reason
            }
          });
        },
        data => {
          switch (data.status) {
            case 200:
              const { iun, recipientInfo, mandateId } = data.value;
              const nextState: AARFlowState = {
                type: sendAARFlowStates.fetchingNotificationData,
                iun,
                fullNameDestinatario: recipientInfo.denomination,
                mandateId
              };
              return setAarFlowState(nextState);
            case 403:
              const notAddresseeFinalState: AARFlowState = {
                type: sendAARFlowStates.notAddresseeFinal,
                iun: data.value.iun,
                fullNameDestinatario: data.value.recipientInfo.denomination,
                qrCode
              };
              return setAarFlowState(notAddresseeFinalState);

            default:
              const reason = `HTTP request failed (${aarProblemJsonAnalyticsReport(
                data.status,
                data.value
              )})`;
              trackSendAARFailure(sendAARFailurePhase, reason);
              const errorState: AARFlowState = {
                type: sendAARFlowStates.ko,
                previousState: { ...currentState },
                ...(data.value !== undefined && { error: data.value }),
                debugData: {
                  phase: sendAARFailurePhase,
                  reason
                }
              };
              return setAarFlowState(errorState);
          }
        }
      )
    );
    yield* put(resultAction);
  } catch (e) {
    const reason = `An error was thrown (${unknownToReason(e)})`;
    trackSendAARFailure(sendAARFailurePhase, reason);
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
