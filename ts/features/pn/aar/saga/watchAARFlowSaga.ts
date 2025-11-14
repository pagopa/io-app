import { race, take, takeLatest } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { SendAARClient, createSendAARClientWithLollipop } from "../api/client";
import { setAarFlowState, terminateAarFlow } from "../store/actions";
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
      yield* raceWithTerminateFlow(
        fetchAARQrCodeSaga(sendAARClient.aarQRCodeCheck, sessionToken, action)
      );
      break;
    case sendAARFlowStates.fetchingNotificationData:
      yield* raceWithTerminateFlow(
        fetchAarDataSaga(sendAARClient.getAARNotification, sessionToken, action)
      );
      break;
  }
}
function* raceWithTerminateFlow(saga: Generator<unknown, unknown>) {
  yield* race({
    task: saga,
    cancel: take(terminateAarFlow)
  });
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
