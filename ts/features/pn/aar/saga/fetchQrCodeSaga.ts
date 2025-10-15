import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { readableReportSimplified } from "@pagopa/ts-commons/lib/reporters";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { SendAARClient } from "../api/client";
import { setAarFlowState } from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import { AARFlowState, sendAARFlowStates } from "../utils/stateUtils";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";
import {
  aarProblemJsonAnalyticsReport,
  trackSendAARFailure
} from "../analytics";
import { unknownToReason } from "../../../messages/utils";

export function* fetchAARQrCodeSaga(
  fetchQRCode: SendAARClient["aarQRCodeCheck"],
  sessionToken: SessionToken
) {
  const currentState = yield* select(currentAARFlowData);

  if (currentState.type !== sendAARFlowStates.fetchingQRData) {
    trackSendAARFailure(
      "AAR Fetch QRCode",
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
        _error => {
          trackSendAARFailure(
            "AAR Fetch QRCode",
            `Decoding failure (${readableReportSimplified(_error)})`
          );
          return setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: { ...currentState }
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
              const reason = aarProblemJsonAnalyticsReport(
                data.status,
                data.value
              );
              trackSendAARFailure(
                "AAR Fetch QRCode",
                `HTTP request failed (${reason})`
              );
              const errorState: AARFlowState = {
                type: sendAARFlowStates.ko,
                previousState: { ...currentState },
                ...(data.value !== undefined && { error: data.value })
              };
              return setAarFlowState(errorState);
          }
        }
      )
    );
    yield* put(resultAction);
  } catch (e) {
    const reason = unknownToReason(e);
    trackSendAARFailure("AAR Fetch QRCode", `An error was thrown (${reason})`);
    yield* put(
      setAarFlowState({
        type: sendAARFlowStates.ko,
        previousState: { ...currentState }
      })
    );
  }
}
