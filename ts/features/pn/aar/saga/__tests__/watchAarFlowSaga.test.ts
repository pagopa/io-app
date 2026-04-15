import { testSaga } from "redux-saga-test-plan";
import { Effect, call } from "redux-saga/effects";
import { take } from "typed-redux-saga/macro";
import { apiUrlPrefix } from "../../../../../config";
import { KeyInfo } from "../../../../lollipop/utils/crypto";
import {
  SendAarClient,
  createSendAarClientWithLollipop
} from "../../api/client";
import {
  setAarFlowState,
  terminateAarFlow,
  initiateAarFlow
} from "../../store/actions";
import { sendAarFlowStates } from "../../utils/stateUtils";
import { initiateAarFlowSaga } from "../initiateAarFlowSaga";
import { fetchAarDataSaga } from "../fetchNotificationDataSaga";
import { fetchAarQrCodeSaga } from "../fetchQrCodeSaga";
import { testable, watchAarFlowSaga } from "../watchAarFlowSaga";
import { validateMandateSaga } from "../validateMandateSaga";
import { isAarInAppDelegationRemoteEnabledSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { createAarMandateSaga } from "../createAarMandateSaga";
const { aarFlowMasterSaga, raceWithTerminateFlow } = testable as NonNullable<
  typeof testable
>;

const mockSessionToken = "mock-session-token";
const mockKeyInfo = {} as KeyInfo;

const mockSendAarClient: SendAarClient = {
  aarQRCodeCheck: jest.fn(),
  getAARNotification: jest.fn(),
  getNotificationAttachment: jest.fn(),
  acceptAARMandate: jest.fn(),
  createAARMandate: jest.fn()
};

describe("watchAarFlowSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should race takeLatest(setAarFlowState) and take(terminateAarFlow)", () => {
    testSaga(watchAarFlowSaga, mockSessionToken, mockKeyInfo)
      .next()
      .call(createSendAarClientWithLollipop, apiUrlPrefix, mockKeyInfo)
      .next(mockSendAarClient)
      .takeLatest(
        setAarFlowState,
        raceWithTerminateFlow,
        mockSendAarClient,
        mockSessionToken
      )
      .next()
      .takeLatest(initiateAarFlow, initiateAarFlowSaga)
      .next()
      .select(isAarInAppDelegationRemoteEnabledSelector)
      .next(false)
      .isDone();
  });

  describe("aARFlowMasterSaga", () => {
    const qrCode = "TESTETST";

    it("should call fetchQrCodeSaga when an updateState action has fetchingQRData as payload", () => {
      const action = setAarFlowState({
        type: sendAarFlowStates.fetchingQRData,
        qrCode
      });

      testSaga(aarFlowMasterSaga, mockSendAarClient, mockSessionToken, action)
        .next()
        .call(
          fetchAarQrCodeSaga,
          mockSendAarClient.aarQRCodeCheck,
          mockSessionToken,
          action
        )
        .next()
        .isDone();
    });
    it("should call the fetchAarDataSaga when an updateState action has getAARNotification as payload", () => {
      const action = setAarFlowState({
        type: sendAarFlowStates.fetchingNotificationData,
        recipientInfo: {
          denomination: "Mario Rossi",
          taxId: "RSSMRA74D22A001Q"
        },
        iun: "123"
      });

      testSaga(aarFlowMasterSaga, mockSendAarClient, mockSessionToken, action)
        .next()
        .call(
          fetchAarDataSaga,
          mockSendAarClient.getAARNotification,
          mockSessionToken,
          action
        )
        .next()
        .isDone();
    });

    it('should call the validateMandateSaga when an updateState action has "validatingMandate" as type', () => {
      const action = setAarFlowState({
        type: sendAarFlowStates.validatingMandate,
        recipientInfo: {
          denomination: "Mario Rossi",
          taxId: "RSSMRA74D22A001Q"
        },
        iun: "123",
        mandateId: "mandate_id",
        signedVerificationCode: "signed_nonce",
        unsignedVerificationCode: "nonce",
        mrtdData: {
          dg1: "",
          dg11: "",
          sod: ""
        },
        nisData: {
          nis: "",
          publicKey: "",
          sod: ""
        }
      });

      testSaga(aarFlowMasterSaga, mockSendAarClient, mockSessionToken, action)
        .next()
        .call(
          validateMandateSaga,
          mockSendAarClient.acceptAARMandate,
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

      testSaga(aarFlowMasterSaga, mockSendAarClient, mockSessionToken, action)
        .next()
        .isDone();
    });
    it("should call createAarMandateSaga when an updateState action has creatingMandate as payload", () => {
      const action = setAarFlowState({
        type: sendAarFlowStates.creatingMandate,
        recipientInfo: {
          denomination: "Mario Rossi",
          taxId: "RSSMRA74D22A001Q"
        },
        iun: "123",
        qrCode: "TESTETST"
      });
      testSaga(aarFlowMasterSaga, mockSendAarClient, mockSessionToken, action)
        .next()
        .call(
          createAarMandateSaga,
          mockSendAarClient.createAARMandate,
          mockSessionToken,
          action
        )
        .next()
        .isDone();
    });
  });
  describe("raceWithTerminateFlow", () => {
    const action = setAarFlowState({
      type: sendAarFlowStates.fetchingQRData,
      qrCode: "TESTETST"
    });
    it("should race aarFlowMasterSaga and take terminateAarFlow", () => {
      const saga = testSaga(
        raceWithTerminateFlow,
        mockSendAarClient,
        mockSessionToken,
        action
      )
        .next()
        .race({
          task: call(
            aarFlowMasterSaga,
            mockSendAarClient,
            mockSessionToken,
            action
          ),
          cancel: take(terminateAarFlow)
        } as unknown as { [key: string]: Effect });

      saga.next("task").isDone();
      saga.next("cancel").isDone();
    });
  });
});
