import { takeLatest } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { SendAARClient, createSendAARClientWithLollipop } from "../api/client";
import { setAarFlowState } from "../store/actions";
import { sendAARFlowStates } from "../store/reducers";
import { fetchQrCodeSaga } from "./fetchQrCodeSaga";

function* aARFlowMasterSaga(
  sendAARClient: SendAARClient,
  sessionToken: SessionToken,
  action: ReturnType<typeof setAarFlowState>
) {
  const nextState = action.payload;

  switch (nextState.type) {
    case sendAARFlowStates.fetchingQRData:
      yield* fetchQrCodeSaga(nextState.qrCode, sendAARClient, sessionToken);
      break;
  }
}

export function* watchAARFlowSaga(
  sessionToken: SessionToken,
  keyInfo: KeyInfo
) {
  const sendAARClient = createSendAARClientWithLollipop(apiUrlPrefix, keyInfo);

  yield* takeLatest(
    setAarFlowState,
    aARFlowMasterSaga,
    sendAARClient,
    sessionToken
  );
}
