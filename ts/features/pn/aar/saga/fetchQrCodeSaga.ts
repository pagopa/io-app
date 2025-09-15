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
  sendAARClient: SendAARClient,
  sessionToken: SessionToken
) {
  const currentState = yield* select(currentAARFlowData);

  if (currentState.type !== sendAARFlowStates.fetchingQRData) {
    return;
  }

  const result = yield* call(() =>
    sendAARClient.checkQRCode({
      Bearer: sessionToken,
      body: {
        qrcode
      }
    })
  );

  if (E.isRight(result)) {
    const data = result.right;
    if (data.status === 200) {
      const nextState: AARFlowState = {
        type: sendAARFlowStates.fetchingNotificationData,
        iun: data.value.iun,
        fullNameDestinatario: data.value.denomination
      };
      yield* put(setAarFlowState(nextState));
    } else if (data.status === 403) {
      // TODO
    } else {
      const nextState: AARFlowState = {
        type: "ko",
        previousState: currentState
      };
      yield* put(setAarFlowState(nextState));
    }
  } else {
    const nextState: AARFlowState = {
      type: "ko",
      previousState: currentState
    };
    yield* put(setAarFlowState(nextState));
  }
}
