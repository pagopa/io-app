import { testSaga } from "redux-saga-test-plan";
import { call } from "typed-redux-saga";
import { SessionToken } from "../../../../../types/SessionToken";
import { KeyInfo } from "../../../../lollipop/utils/crypto";
import * as SEND_CLIENT from "../../api/client";
import { setAarFlowState } from "../../store/actions";
import * as FETCH_QR_SAGA from "../fetchQrCodeSaga";
import { aarFlowMasterSaga, watchAarFlowSaga } from "../watchAARFlowSaga";
import { sendAARFlowStates } from "../../utils/stateUtils";
import * as FETCH_DATA_SAGA from "../fetchNotificationDataSaga";

describe("watchAarFlowSaga", () => {
  const mockSessionToken = "mock-session-token" as SessionToken;
  const mockKeyInfo = {} as KeyInfo;

  const mockSendAARClient: SEND_CLIENT.SendAARClient = {
    aarQRCodeCheck: jest.fn(),
    getAARNotification: jest.fn(),
    getNotificationAttachment: jest.fn()
  };
  const mockCreateClient = jest.spyOn(
    SEND_CLIENT,
    "createSendAARClientWithLollipop"
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockImplementation(() => mockSendAARClient);
  });

  it("should register takeLatest for setAarFlowState", () => {
    testSaga(watchAarFlowSaga, mockSessionToken, mockKeyInfo)
      .next()
      .takeLatest(
        setAarFlowState,
        aarFlowMasterSaga,
        mockSendAARClient,
        mockSessionToken
      )
      .next()
      .isDone();
  });

  describe("aARFlowMasterSaga", () => {
    const qrCode = "TESTETST";

    it("should call fetchQrCodeSaga when an updateState action has fetchingQRData as payload", () => {
      const mockFn = jest.fn();
      jest
        .spyOn(FETCH_QR_SAGA, "fetchAARQrCodeSaga")
        .mockImplementation(function* (_client: any, _token: string) {
          yield* call(mockFn);
        } as typeof FETCH_QR_SAGA.fetchAARQrCodeSaga);
      const action = setAarFlowState({
        type: sendAARFlowStates.fetchingQRData,
        qrCode
      });

      testSaga(aarFlowMasterSaga, mockSendAARClient, mockSessionToken, action)
        .next()
        .call(mockFn) // this equates to switching the saga to the aar qr one
        .next()
        .isDone();
    });
    it("should call the fetchAarDataSaga when an updateState action has getAARNotification as payload", () => {
      const mockFn = jest.fn();
      jest
        .spyOn(FETCH_DATA_SAGA, "fetchAarDataSaga")
        .mockImplementation(function* (_client: any, _token: string) {
          yield* call(mockFn);
        } as typeof FETCH_DATA_SAGA.fetchAarDataSaga);
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
        .call(mockFn) // this equates to switching the saga to the aar qr one
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
