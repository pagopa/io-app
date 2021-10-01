import { testSaga } from "redux-saga-test-plan";
import { none, some } from "fp-ts/lib/Option";
import { paymentStartRequest } from "../pagopaApis";
import { SessionManager } from "../../../utils/SessionManager";
import { PaymentManagerToken } from "../../../types/pagopa";
import { paymentExecuteStart } from "../../../store/actions/wallet/payment";

jest.mock("@react-native-community/async-storage", () => ({
  AsyncStorage: jest.fn()
}));

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

jest.mock("react-native-background-timer", () => ({
  startTimer: jest.fn()
}));

describe("paymentStartRequest", () => {
  it("can get a pm token", () => {
    const mockToken = "1234" as PaymentManagerToken;
    const aPmSessionManager: SessionManager<PaymentManagerToken> =
      new SessionManager(jest.fn());
    jest
      .spyOn(aPmSessionManager, "getNewToken")
      .mockReturnValue(Promise.resolve(some(mockToken)));
    testSaga(paymentStartRequest, aPmSessionManager)
      .next()
      .call(aPmSessionManager.getNewToken)
      .next(some(mockToken))
      .put(paymentExecuteStart.success(mockToken))
      .next();
  });

  it("cannot get a pm token", () => {
    const aPmSessionManager: SessionManager<PaymentManagerToken> =
      new SessionManager(jest.fn());
    jest
      .spyOn(aPmSessionManager, "getNewToken")
      .mockReturnValue(Promise.resolve(none));
    testSaga(paymentStartRequest, aPmSessionManager)
      .next()
      .call(aPmSessionManager.getNewToken)
      .next(none)
      .put(
        paymentExecuteStart.failure(
          new Error("cannot retrieve a valid PM session token")
        )
      )
      .next();
  });
});
