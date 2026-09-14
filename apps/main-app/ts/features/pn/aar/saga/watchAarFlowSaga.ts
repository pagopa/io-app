import { call, race, select, take, takeLatest } from "typed-redux-saga/macro";

import { apiUrlPrefix } from "../../../../config";
import { isAarInAppDelegationRemoteEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isTestEnv } from "../../../../utils/environment";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { createSendAarClientWithLollipop, SendAarClient } from "../api/client";
import {
  initiateAarFlow,
  setAarFlowState,
  terminateAarFlow,
  testAarAcceptMandate,
  testAarCreateMandate
} from "../store/actions";
import { sendAarFlowStates } from "../utils/stateUtils";
import { createAarMandateSaga } from "./createAarMandateSaga";
import { fetchAarDataSaga } from "./fetchNotificationDataSaga";
import { fetchAarQrCodeSaga } from "./fetchQrCodeSaga";
import { initiateAarFlowSaga } from "./initiateAarFlowSaga";
import {
  testAarAcceptMandateSaga,
  testAarCreateMandateSaga
} from "./testSendNisMrtdSaga";
import { validateMandateSaga } from "./validateMandateSaga";

export function* watchAarFlowSaga(sessionToken: string, keyInfo: KeyInfo) {
  const sendAarClient = yield* call(
    createSendAarClientWithLollipop,
    apiUrlPrefix,
    keyInfo
  );

  yield* takeLatest(
    setAarFlowState,
    raceWithTerminateFlow,
    sendAarClient,
    sessionToken
  );
  yield* takeLatest(initiateAarFlow, initiateAarFlowSaga);
  const isAarMandateEnabled = yield* select(
    isAarInAppDelegationRemoteEnabledSelector
  );
  if (isAarMandateEnabled) {
    yield* takeLatest(
      testAarCreateMandate.request,
      testAarCreateMandateSaga,
      sendAarClient,
      sessionToken
    );
    yield* takeLatest(
      testAarAcceptMandate.request,
      testAarAcceptMandateSaga,
      sendAarClient,
      sessionToken
    );
  }
}

function* aarFlowMasterSaga(
  sendAarClient: SendAarClient,
  sessionToken: string,
  action: ReturnType<typeof setAarFlowState>
) {
  const nextState = action.payload;

  switch (nextState.type) {
    case sendAarFlowStates.creatingMandate:
      yield* call(
        createAarMandateSaga,
        sendAarClient.createAARMandate,
        sessionToken,
        action
      );
      break;
    case sendAarFlowStates.fetchingNotificationData:
      yield* call(
        fetchAarDataSaga,
        sendAarClient.getAARNotification,
        sessionToken,
        action
      );
      break;
    case sendAarFlowStates.fetchingQRData:
      yield* call(
        fetchAarQrCodeSaga,
        sendAarClient.aarQRCodeCheck,
        sessionToken,
        action
      );
      break;
    case sendAarFlowStates.validatingMandate:
      yield* call(
        validateMandateSaga,
        sendAarClient.acceptAARMandate,
        sessionToken,
        action
      );
      break;
  }
}

function* raceWithTerminateFlow(
  sendAarClient: SendAarClient,
  sessionToken: string,
  action: ReturnType<typeof setAarFlowState>
) {
  yield* race({
    task: call(aarFlowMasterSaga, sendAarClient, sessionToken, action),
    cancel: take(terminateAarFlow)
  });
}
export const testable = isTestEnv
  ? {
      raceWithTerminateFlow,
      aarFlowMasterSaga
    }
  : null;
