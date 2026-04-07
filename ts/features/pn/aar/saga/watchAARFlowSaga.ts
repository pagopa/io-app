import { call, race, select, take, takeLatest } from "typed-redux-saga/macro";

import { apiUrlPrefix } from "../../../../config";
import { isAarInAppDelegationRemoteEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { isTestEnv } from "../../../../utils/environment";
import { KeyInfo } from "../../../lollipop/utils/crypto";
import { createSendAARClientWithLollipop, SendAARClient } from "../api/client";
import {
  initiateAarFlow,
  setAarFlowState,
  terminateAarFlow,
  testAarAcceptMandate,
  testAarCreateMandate
} from "../store/actions";
import { sendAARFlowStates } from "../utils/stateUtils";
import { createAarMandateSaga } from "./createAarMandateSaga";
import { fetchAarDataSaga } from "./fetchNotificationDataSaga";
import { fetchAARQrCodeSaga } from "./fetchQrCodeSaga";
import { initiateAarFlowSaga } from "./initiateAarFlowSaga";
import {
  testAarAcceptMandateSaga,
  testAarCreateMandateSaga
} from "./testSendNisMrtdSaga";
import { validateMandateSaga } from "./validateMandateSaga";

export function* watchAarFlowSaga(sessionToken: string, keyInfo: KeyInfo) {
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

function* aarFlowMasterSaga(
  sendAARClient: SendAARClient,
  sessionToken: string,
  action: ReturnType<typeof setAarFlowState>
) {
  const nextState = action.payload;

  switch (nextState.type) {
    case sendAARFlowStates.creatingMandate:
      yield* call(
        createAarMandateSaga,
        sendAARClient.createAARMandate,
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
    case sendAARFlowStates.fetchingQRData:
      yield* call(
        fetchAARQrCodeSaga,
        sendAARClient.aarQRCodeCheck,
        sessionToken,
        action
      );
      break;
    case sendAARFlowStates.validatingMandate:
      yield* call(
        validateMandateSaga,
        sendAARClient.acceptAARMandate,
        sessionToken,
        action
      );
      break;
  }
}

function* raceWithTerminateFlow(
  sendAARClient: SendAARClient,
  sessionToken: string,
  action: ReturnType<typeof setAarFlowState>
) {
  yield* race({
    task: call(aarFlowMasterSaga, sendAARClient, sessionToken, action),
    cancel: take(terminateAarFlow)
  });
}
export const testable = isTestEnv
  ? {
      raceWithTerminateFlow,
      aarFlowMasterSaga
    }
  : null;
