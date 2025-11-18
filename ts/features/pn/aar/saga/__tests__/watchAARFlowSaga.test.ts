import { testSaga } from "redux-saga-test-plan";
import { Effect } from "redux-saga/effects";
import { take, takeLatest } from "typed-redux-saga/macro";
import { SessionToken } from "../../../../../types/SessionToken";
import { KeyInfo } from "../../../../lollipop/utils/crypto";
import {
  setAarFlowState,
  terminateAarFlow,
  tryInitiateAarFlow
} from "../../store/actions";
import { sendAARFlowStates } from "../../utils/stateUtils";
import { initiateAarFlowIfEnabled } from "../InitiateAarFlowIfEnabledSaga";
import { aarFlowMasterSaga, watchAarFlowSaga } from "../watchAARFlowSaga";
import { fetchAARQrCodeSaga } from "../fetchQrCodeSaga";
import {
  SendAARClient,
  createSendAARClientWithLollipop
} from "../../api/client";
import { apiUrlPrefix } from "../../../../../config";
import { fetchAarDataSaga } from "../fetchNotificationDataSaga";

const mockSessionToken = "mock-session-token" as SessionToken;
const mockKeyInfo = {} as KeyInfo;

const mockSendAARClient: SendAARClient = {
  aarQRCodeCheck: jest.fn(),
  getAARNotification: jest.fn(),
  getNotificationAttachment: jest.fn()
};

describe("watchAarFlowSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should race takeLatest(setAarFlowState) and take(terminateAarFlow)", () => {
    const raceEffect = {
      task: takeLatest(
        setAarFlowState,
        aarFlowMasterSaga,
        mockSendAARClient,
        mockSessionToken
      ),
      cancel: take(terminateAarFlow)
    } as unknown as { [key: string]: Effect };

    testSaga(watchAarFlowSaga, mockSessionToken, mockKeyInfo)
      .next()
      .call(createSendAARClientWithLollipop, apiUrlPrefix, mockKeyInfo)
      .next(mockSendAARClient)
      .race(raceEffect)
      .next()
      .takeLatest(tryInitiateAarFlow, initiateAarFlowIfEnabled)
      .next()
      .isDone();
  });

  describe("aARFlowMasterSaga", () => {
    const qrCode = "TESTETST";

    it("should call fetchQrCodeSaga when an updateState action has fetchingQRData as payload", () => {
      const action = setAarFlowState({
        type: sendAARFlowStates.fetchingQRData,
        qrCode
      });

      testSaga(aarFlowMasterSaga, mockSendAARClient, mockSessionToken, action)
        .next()
        .call(
          fetchAARQrCodeSaga,
          mockSendAARClient.aarQRCodeCheck,
          mockSessionToken,
          action
        )
        .next()
        .isDone();
    });
    it("should call the fetchAarDataSaga when an updateState action has getAARNotification as payload", () => {
      const action = setAarFlowState({
        type: sendAARFlowStates.fetchingNotificationData,
        recipientInfo: {
          denomination: "Mario Rossi",
          taxId: "RSSMRA74D22A001Q"
        },
        iun: "123"
      });

      testSaga(aarFlowMasterSaga, mockSendAARClient, mockSessionToken, action)
        .next()
        .call(
          fetchAarDataSaga,
          mockSendAARClient.getAARNotification,
          mockSessionToken,
          action
        )
        .next()
        .isDone();
    });

    it("should do nothing when called with an unknown flow state", () => {
      const action = setAarFlowState({
        type: "unknownState" as any
      });

      testSaga(aarFlowMasterSaga, mockSendAARClient, mockSessionToken, action)
        .next()
        .isDone();
    });
  });
});
