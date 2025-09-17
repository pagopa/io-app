import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { SessionToken } from "../../../../types/SessionToken";
import { SendAARClient } from "../api/client";
import { setAarFlowState } from "../store/actions";
import {
  AARFlowState,
  currentAARFlowData,
  sendAARFlowStates
} from "../store/reducers";

export function* fetchAARQrCodeSaga(
  qrcode: string,
  fetchQRCode: SendAARClient["aarQRCodeCheck"],
  sessionToken: SessionToken
) {
  const currentState = yield* select(currentAARFlowData);

  if (currentState.type !== sendAARFlowStates.fetchingQRData) {
    return;
  }
  try {
    const result = yield* call(fetchQRCode, {
      Bearer: sessionToken,
      body: {
        aarQrCodeValue: qrcode
      }
    });

    const resultAction = pipe(
      result,
      E.fold(
        _error =>
          setAarFlowState({
            type: sendAARFlowStates.ko,
            previousState: currentState
          }),
        data => {
          switch (data.status) {
            case 200:
              const { iun, recipientInfo } = data.value;
              const nextState: AARFlowState = {
                type: sendAARFlowStates.fetchingNotificationData,
                iun,
                fullNameDestinatario: recipientInfo.denomination
              };
              return setAarFlowState(nextState);
            default:
              const errorState: AARFlowState = {
                type: sendAARFlowStates.ko,
                previousState: currentState
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
        previousState: currentState
      })
    );
  }
}
