import { testSaga } from "redux-saga-test-plan";
import { SessionToken } from "../../../../../types/SessionToken";
import { KeyInfo } from "../../../../lollipop/utils/crypto";
import {
  createSendAARClientWithLollipop,
  SendAARClient
} from "../../api/client";
import { setAarFlowState } from "../../store/actions";
import { sendAARFlowStates } from "../../store/reducers";
import * as fetchQrCodeSagaModule from "../fetchQrCodeSaga";
import { aARFlowMasterSaga, watchAARFlowSaga } from "../watchAARFlowSaga";

jest.mock("../../api/client", () => ({
  createSendAARClientWithLollipop: jest.fn()
}));

describe("aARFlowSaga", () => {
  const mockSessionToken = "mock-session-token" as SessionToken;
  const mockKeyInfo = { someKey: "value" } as unknown as KeyInfo;

  const mockSendAARClient: SendAARClient = {
    checkQRCode: jest.fn(),
    getNotification: jest.fn(),
    getNotificationAttachment: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (createSendAARClientWithLollipop as jest.Mock).mockReturnValue(
      mockSendAARClient
    );
  });

  describe("watchAARFlowSaga", () => {
    it("should register takeLatest for setAarFlowState", () => {
      testSaga(watchAARFlowSaga, mockSessionToken, mockKeyInfo)
        .next()
        .call(createSendAARClientWithLollipop, expect.anything(), mockKeyInfo)
        .next(mockSendAARClient)
        .takeLatest(
          setAarFlowState,
          aARFlowMasterSaga,
          mockSendAARClient,
          mockSessionToken
        )
        .next()
        .isDone();
    });
  });

  describe("aARFlowMasterSaga", () => {
    const qrCode =
      "https://cittadini.notifichedigitali.it/io?aar=MDAwMDAwMDAwMDAwMDAwMDAwMDAwMVNFTkRfUEYtMTU4ODM3ZDItMWI4OS00NGYxLWFhMjQtOGVhOTEzZjkyZGI0X2NiYzk2YjdjLTI0MmUtNGIzZi1hZGYwLTE5NGJmNjY4ZGJhNw==";

    it("should call fetchQrCodeSaga when state is fetchingQRData", () => {
      const action = setAarFlowState({
        type: sendAARFlowStates.fetchingQRData,
        qrCode
      });

      testSaga(aARFlowMasterSaga, mockSendAARClient, mockSessionToken, action)
        .next()
        .call(
          fetchQrCodeSagaModule.fetchQrCodeSaga,
          qrCode,
          mockSendAARClient.checkQRCode,
          mockSessionToken
        )
        .next()
        .isDone();
    });

    it("should do nothing for unknown flow state", () => {
      const action = setAarFlowState({
        type: "unknownState" as any
      });

      testSaga(aARFlowMasterSaga, mockSendAARClient, mockSessionToken, action)
        .next()
        .isDone();
    });
  });
});
