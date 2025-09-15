import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { SessionToken } from "../../../../types/SessionToken";
import { SendAARClient } from "../api/client";
import { setAarFlowState } from "../store/actions";
import {
  AARFlowState,
  currentAARFlowData,
  sendAARFlowStates
} from "../store/reducers";

export function* fetchQrCodeSaga(
  qrcode: string,
  fetchQRCode: SendAARClient["checkQRCode"],
  sessionToken: SessionToken
) {
  const currentState = yield* select(currentAARFlowData);

  if (currentState.type !== sendAARFlowStates.fetchingQRData) {
    return;
  }

  const result = yield* call(() =>
    fetchQRCode({
      Bearer: sessionToken,
      body: {
        qrcode
      }
    })
  );

  if (E.isRight(result)) {
    const data = result.right;
    switch (data.status) {
      case 200:
        const { iun, denomination } = data.value;
        const nextState: AARFlowState = {
          type: sendAARFlowStates.fetchingNotificationData,
          iun,
          fullNameDestinatario: denomination
        };
        yield* put(setAarFlowState(nextState));
        break;
      default:
        const errorState: AARFlowState = {
          type: "ko",
          previousState: currentState
        };
        yield* put(setAarFlowState(errorState));
        break;
    }
  } else {
    const nextState: AARFlowState = {
      type: "ko",
      previousState: currentState
    };
    yield* put(setAarFlowState(nextState));
  }
}
