import { call, race, take, takeLatest } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { SendAARClient, createSendAARClientWithLollipop } from "../api/client";
import {
  setAarFlowState,
  terminateAarFlow,
  tryInitiateAarFlow
} from "../store/actions";
import { sendAARFlowStates } from "../utils/stateUtils";
import { initiateAarFlowIfEnabled } from "./InitiateAarFlowIfEnabledSaga";
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
      yield* call(
        fetchAARQrCodeSaga,
        sendAARClient.aarQRCodeCheck,
        sessionToken,
        action
      );
      break;
    case sendAARFlowStates.fetchingNotificationData:
      yield* call(
        fetchAarDataSaga,
        sendAARClient.getAARNotification,
        sessionToken,
        action
      );
      break;
  }
}

export function* watchAarFlowSaga(
  sessionToken: SessionToken,
  keyInfo: KeyInfo
) {
  const sendAARClient = yield* call(
    createSendAARClientWithLollipop,
    apiUrlPrefix,
    keyInfo
  );

  yield* race({
    task: takeLatest(
      setAarFlowState,
      aarFlowMasterSaga,
      sendAARClient,
      sessionToken
    ),
    cancel: take(terminateAarFlow)
  });
  yield* takeLatest(tryInitiateAarFlow, initiateAarFlowIfEnabled);
}
