import * as E from "fp-ts/lib/Either";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { SessionToken } from "../../../../../types/SessionToken";
import { setAarFlowState } from "../../store/actions";
import { AARFlowState, currentAARFlowData } from "../../store/reducers";
import { fetchQrCodeSaga } from "../fetchQrCodeSaga";

describe("fetchQrCodeSaga", () => {
  const aQRCode =
    "https://cittadini.notifichedigitali.it/io?aar=MDAwMDAwMDAwMDAwMDAwMDAwMDAwMVNFTkRfUEYtMTU4ODM3ZDItMWI4OS00NGYxLWFhMjQtOGVhOTEzZjkyZGI0X2NiYzk2YjdjLTI0MmUtNGIzZi1hZGYwLTE5NGJmNjY4ZGJhNw==";
  const sessionToken: SessionToken = "test-session-token" as SessionToken;
  const mockResponse = {
    iun: "iun-123",
    denomination: "Mario Rossi"
  };
  const mockPrevState: AARFlowState = {
    type: "ko",
    previousState: {
      type: "fetchingQRData",
      qrCode: aQRCode
    }
  };

  const mockFetchQrCode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should dispatch success state on 200 response", () => {
    mockFetchQrCode.mockResolvedValueOnce(
      E.right({
        status: 200,
        value: mockResponse
      })
    );

    return expectSaga(fetchQrCodeSaga, aQRCode, mockFetchQrCode, sessionToken)
      .provide([
        [
          matchers.select(currentAARFlowData),
          {
            type: "fetchingQRData",
            qrCode: aQRCode
          }
        ]
      ])
      .put(
        setAarFlowState({
          type: "fetchingNotificationData",
          iun: mockResponse.iun,
          fullNameDestinatario: mockResponse.denomination
        })
      )
      .run();
  });

  it("should dispatch KO state on 500 response", () => {
    mockFetchQrCode.mockResolvedValueOnce(
      E.right({
        status: 500,
        value: undefined
      })
    );

    return expectSaga(fetchQrCodeSaga, aQRCode, mockFetchQrCode, sessionToken)
      .provide([
        [
          matchers.select(currentAARFlowData),
          {
            type: "fetchingQRData",
            qrCode: aQRCode
          }
        ]
      ])
      .put(setAarFlowState(mockPrevState))
      .run();
  });

  it("should dispatch KO state on decode error (Left)", () => {
    mockFetchQrCode.mockResolvedValueOnce(
      E.left([
        {
          context: [],
          message: "Invalid QR code format",
          value: null
        }
      ])
    );

    return expectSaga(fetchQrCodeSaga, aQRCode, mockFetchQrCode, sessionToken)
      .provide([
        [
          matchers.select(currentAARFlowData),
          {
            type: "fetchingQRData",
            qrCode: aQRCode
          }
        ]
      ])
      .put(setAarFlowState(mockPrevState))
      .run();
  });

  it("should dispatch KO state on exception throw", () => {
    const error = new Error("Fetch qrcode Fetch error");
    const mockCheck = jest.fn().mockRejectedValueOnce(error);

    return expectSaga(fetchQrCodeSaga, aQRCode, mockCheck, sessionToken)
      .put(setAarFlowState(mockPrevState))
      .run();
  });
});
