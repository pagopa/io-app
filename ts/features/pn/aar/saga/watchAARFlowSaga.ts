import { takeLatest } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { SendAARClient, createSendAARClientWithLollipop } from "../api/client";
import { setAarFlowState } from "../store/actions";
import { sendAARFlowStates } from "../utils/stateUtils";
import { fetchAarDataSaga } from "./fetchNotificationDataSaga";
import { fetchAARQrCodeSaga } from "./fetchQrCodeSaga";

export function* aarFlowMasterSaga(
  sendAARClient: SendAARClient,
  sessionToken: SessionToken,
  action: ReturnType<typeof setAarFlowState>
) {
  const nextState = action.payload;

  switch (nextState.type) {
    case sendAARFlowStates.fetchingQRData:
      yield* fetchAARQrCodeSaga(sendAARClient.aarQRCodeCheck, sessionToken);
      break;
    case sendAARFlowStates.fetchingNotificationData:
      yield* fetchAarDataSaga(sendAARClient.getAARNotification, sessionToken);
      break;
  }
}

export function* watchAarFlowSaga(
  sessionToken: SessionToken,
  keyInfo: KeyInfo
) {
  const sendAARClient = createSendAARClientWithLollipop(apiUrlPrefix, keyInfo);

  yield* takeLatest(
    setAarFlowState,
    aarFlowMasterSaga,
    sendAARClient,
    sessionToken
  );
}
