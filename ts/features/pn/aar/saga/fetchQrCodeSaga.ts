import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { isPnTestEnabledSelector } from "../../../../store/reducers/persistedPreferences";
import { SessionToken } from "../../../../types/SessionToken";
import { SendAARClient } from "../api/client";
import { setAarFlowState } from "../store/actions";
import { currentAARFlowData } from "../store/selectors";
import { AARFlowState, sendAARFlowStates } from "../utils/stateUtils";
import { withRefreshApiCall } from "../../../authentication/fastLogin/saga/utils";
import { SagaCallReturnType } from "../../../../types/utils";

export function* fetchAARQrCodeSaga(
  fetchQRCode: SendAARClient["aarQRCodeCheck"],
  sessionToken: SessionToken
) {
  const currentState = yield* select(currentAARFlowData);

  if (currentState.type !== sendAARFlowStates.fetchingQRData) {
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
        _error =>
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: { ...currentState }
          }),
        data => {
          switch (data.status) {
            case 200:
              const { iun, recipientInfo, mandateId } = data.value;
              const nextState: AARFlowState = {
                type: sendAARFlowStates.fetchingNotificationData,
                iun,
                recipientInfo: { ...recipientInfo },
                mandateId
              };
              return setAarFlowState(nextState);
            case 403:
              const notAddresseeFinalState: AARFlowState = {
                type: sendAARFlowStates.notAddresseeFinal,
                iun: data.value.iun,
                recipientInfo: { ...data.value.recipientInfo },
                qrCode
              };
              return setAarFlowState(notAddresseeFinalState);

            default:
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
    yield* put(
      setAarFlowState({
        type: sendAARFlowStates.ko,
        previousState: { ...currentState }
      })
    );
  }
}
