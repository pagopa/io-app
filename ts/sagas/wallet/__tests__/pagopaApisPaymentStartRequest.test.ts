import * as O from "fp-ts/lib/Option";
import { testSaga } from "redux-saga-test-plan";
import { paymentExecuteStart } from "../../../store/actions/wallet/payment";
import { PaymentManagerToken } from "../../../types/pagopa";
import { SessionManager } from "../../../utils/SessionManager";
import { paymentStartRequest } from "../pagopaApis";

jest.mock("@react-native-async-storage/async-storage", () => ({
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
      .mockReturnValue(Promise.resolve(O.some(mockToken)));
    testSaga(paymentStartRequest, aPmSessionManager)
      .next()
      .call(aPmSessionManager.getNewToken)
      .next(O.some(mockToken))
      .put(paymentExecuteStart.success(mockToken))
      .next();
  });

  it("cannot get a pm token", () => {
    const aPmSessionManager: SessionManager<PaymentManagerToken> =
      new SessionManager(jest.fn());
    jest
      .spyOn(aPmSessionManager, "getNewToken")
      .mockReturnValue(Promise.resolve(O.none));
    testSaga(paymentStartRequest, aPmSessionManager)
      .next()
      .call(aPmSessionManager.getNewToken)
      .next(O.none)
      .put(
        paymentExecuteStart.failure(
          new Error("cannot retrieve a valid PM session token")
        )
      )
      .next();
  });
});
