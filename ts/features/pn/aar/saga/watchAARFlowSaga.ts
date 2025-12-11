import { call, race, select, take, takeLatest } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../config";
import { SessionToken } from "../../../../types/SessionToken";
import { isTestEnv } from "../../../../utils/environment";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { SendAARClient, createSendAARClientWithLollipop } from "../api/client";
import {
  setAarFlowState,
  terminateAarFlow,
  initiateAarFlow,
  testAarCreateMandate,
  testAarAcceptMandate
} from "../store/actions";
import { isAarInAppDelegationRemoteEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { sendAARFlowStates } from "../utils/stateUtils";
import { initiateAarFlowSaga } from "./initiateAarFlowSaga";
import { fetchAarDataSaga } from "./fetchNotificationDataSaga";
import { fetchAARQrCodeSaga } from "./fetchQrCodeSaga";
import {
  testAarAcceptMandateSaga,
  testAarCreateMandateSaga
} from "./testSendNisMrtdSaga";
import { createAarMandateSaga } from "./createAarMandateSaga";

function* aarFlowMasterSaga(
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
    case sendAARFlowStates.creatingMandate:
      yield* call(
        createAarMandateSaga,
        sendAARClient.createAARMandate,
        sessionToken,
        action
      );
      break;
  }
}

function* raceWithTerminateFlow(
  sendAARClient: SendAARClient,
  sessionToken: SessionToken,
  action: ReturnType<typeof setAarFlowState>
) {
  yield* race({
    task: call(aarFlowMasterSaga, sendAARClient, sessionToken, action),
    cancel: take(terminateAarFlow)
  });
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

  yield* takeLatest(
    setAarFlowState,
    raceWithTerminateFlow,
    sendAARClient,
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
      sendAARClient,
      sessionToken
    );
    yield* takeLatest(
      testAarAcceptMandate.request,
      testAarAcceptMandateSaga,
      sendAARClient,
      sessionToken
    );
  }
}
export const testable = isTestEnv
  ? {
      raceWithTerminateFlow,
      aarFlowMasterSaga
    }
  : null;
