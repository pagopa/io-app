import * as E from "fp-ts/lib/Either";
import { testSaga } from "redux-saga-test-plan";
import { SessionToken } from "../../../../../types/SessionToken";
import { setAarFlowState } from "../../store/actions";
import {
  AARFlowState,
  currentAARFlowData,
  sendAARFlowStates
} from "../../store/reducers";
import { fetchAARQrCodeSaga } from "../fetchQrCodeSaga";
import { SendAARClient } from "../../api/client";

describe("fetchQrCodeSaga", () => {
  const aQRCode = "TESTTEST";
  const sessionToken: SessionToken = "test-session-token" as SessionToken;
  const getMockKoState = (prevState: AARFlowState): AARFlowState => ({
    type: "ko",
    previousState: prevState
  });
  const mockFetchingQrState: AARFlowState = {
    type: "fetchingQRData",
    qrCode: aQRCode
  };
  const mockTosState: AARFlowState = {
    type: "displayingAARToS",
    qrCode: aQRCode
  };

  const mockFetchQrCode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should correctly update state on a 200 response", () => {
    const successState: AARFlowState = {
      type: sendAARFlowStates.fetchingNotificationData,
      iun: "123123",
      fullNameDestinatario: "nomecognome"
    };
    const successResponse = E.right({
      headers: {},
      status: 200,
      value: {
        iun: "123123",
        recipientInfo: {
          denomination: "nomecognome",
          taxId: "taxID"
        }
      }
    });
    const mockApiCall = () =>
      new Promise((res, _reject) =>
        res(successResponse)
      ) as unknown as ReturnType<SendAARClient["aarQRCodeCheck"]>;

    testSaga(fetchAARQrCodeSaga, aQRCode, mockApiCall, sessionToken)
      .next()
      .select(currentAARFlowData)
      .next(mockFetchingQrState)
      .call(mockApiCall, {
        Bearer: sessionToken,
        body: {
          aarQrCodeValue: aQRCode
        }
      })
      .next(successResponse)
      .put(setAarFlowState(successState))
      .next()
      .isDone();
  });

  [
    E.left(undefined),
    E.right({ status: 500, value: undefined }),
    E.right({ status: 418, value: undefined }),
    E.right({ status: 403, value: undefined })
  ].forEach(res =>
    it(`should dispatch KO state on a response of ${JSON.stringify(
      res
    )}`, () => {
      testSaga(fetchAARQrCodeSaga, aQRCode, mockFetchQrCode, sessionToken)
        .next()
        .select(currentAARFlowData)
        .next(mockFetchingQrState)
        .call(mockFetchQrCode, {
          Bearer: sessionToken,
          body: {
            aarQrCodeValue: aQRCode
          }
        })
        .next(res)
        .put(setAarFlowState(getMockKoState(mockFetchingQrState)))
        .next()
        .isDone();
    })
  );

  it("should exit early if the current state is wrong", () => {
    testSaga(fetchAARQrCodeSaga, aQRCode, mockFetchQrCode, sessionToken)
      .next()
      .select(currentAARFlowData)
      .next(mockTosState)
      .isDone();
  });
  it("should dispatch KO state on exception throw", () => {
    testSaga(fetchAARQrCodeSaga, aQRCode, mockFetchQrCode, sessionToken)
      .next()
      .select(currentAARFlowData)
      .next(mockFetchingQrState)
      .call(mockFetchQrCode, {
        Bearer: sessionToken,
        body: {
          aarQrCodeValue: aQRCode
        }
      })
      .throw(new Error())
      .put(setAarFlowState(getMockKoState(mockFetchingQrState)))
      .next()
      .isDone();
  });
});
