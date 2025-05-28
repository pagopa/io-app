import { put, call, takeLatest, take, delay } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import * as E from "fp-ts/lib/Either";
import {
  testableTokenRefreshSaga,
  watchTokenRefreshSaga
} from "../tokenRefreshSaga";
import {
  askUserToRefreshSessionToken,
  refreshSessionToken,
  refreshTokenNoPinError,
  testable
} from "../../store/actions/tokenRefreshActions";

import { getPin } from "../../../../../utils/keychain";
import { logoutRequest } from "../../../common/store/actions";
import { dismissSupport } from "../../../../../utils/supportAssistance";
import NavigationService from "../../../../../navigation/NavigationService";
import ROUTES from "../../../../../navigation/routes";
import { MESSAGES_ROUTES } from "../../../../messages/navigation/routes";
import { fastLoginMaxRetries } from "../../../../../config";
import {
  identificationFailure,
  identificationRequest,
  identificationSuccess
} from "../../../../identification/store/actions";

jest.mock("../../../../../navigation/NavigationService", () => ({
  navigate: jest.fn()
}));

jest.mock("../../../../../utils/keychain", () => ({
  getPin: jest.fn()
}));

jest.mock("../../../../../utils/supportAssistance", () => ({
  dismissSupport: jest.fn()
}));

describe("tokenRefreshSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  if (!testableTokenRefreshSaga) {
    throw new Error(
      "handleApplicationInitialized is not available in test environment"
    );
  }
  const handleRefreshSessionToken =
    testableTokenRefreshSaga.handleRefreshSessionToken;
  const doRefreshTokenSaga = testableTokenRefreshSaga.doRefreshTokenSaga;
  const handleRequestError = testableTokenRefreshSaga.handleRequestError;
  const RequestStateType = testableTokenRefreshSaga.types.RequestStateType;

  if (!testable?.types.RefreshSessionTokenRequestPayload) {
    throw new Error(
      "RefreshSessionTokenRequestPayload is not available in test environment"
    );
  }
  const RefreshSessionTokenRequestPayload =
    testable?.types.RefreshSessionTokenRequestPayload;

  it("should watch refreshSessionToken.request with takeLatest", () => {
    const gen = watchTokenRefreshSaga();
    expect(gen.next().value).toEqual(
      takeLatest(refreshSessionToken.request, handleRefreshSessionToken)
    );
  });

  describe("handleRefreshSessionToken", () => {
    const createAction = (
      withUserInteraction: typeof RefreshSessionTokenRequestPayload
    ) => refreshSessionToken.request(withUserInteraction);

    it("should dispatch refreshTokenNoPinError if pin is missing and interaction is true", () => {
      const action = createAction({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: false
      });
      const gen = handleRefreshSessionToken(action);
      expect(gen.next().value).toEqual(call(dismissSupport));
      expect(gen.next(null).value).toEqual(call(getPin));
      expect(gen.next(O.none).value).toEqual(put(refreshTokenNoPinError()));
      expect(gen.next().done).toBe(true);
    });

    it("should dispatch logoutRequest if pin is missing and interaction is false", () => {
      const action = createAction({
        withUserInteraction: false,
        showIdentificationModalAtStartup: false,
        showLoader: false
      });

      const gen = handleRefreshSessionToken(action);

      expect(gen.next().value).toEqual(call(dismissSupport));
      expect(gen.next(null).value).toEqual(call(getPin));
      expect(gen.next(O.none).value).toEqual(
        put(logoutRequest({ withApiCall: false }))
      );
      expect(gen.next().done).toBe(true);
    });

    it("should wait for user confirmation and proceed if user says yes", () => {
      const action = createAction({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: false
      });

      const gen = handleRefreshSessionToken(action);

      expect(gen.next().value).toEqual(call(dismissSupport));
      expect(gen.next(null).value).toEqual(call(getPin));
      expect(gen.next(O.some("147493")).value).toEqual(
        put(askUserToRefreshSessionToken.request())
      );

      expect(gen.next().value).toEqual(
        take("ASK_USER_TO_REFRESH_SESSION_TOKEN_SUCCESS")
      );

      const mockSuccessAction = askUserToRefreshSessionToken.success("yes");
      expect(gen.next(mockSuccessAction).value).toEqual(
        put(identificationRequest())
      );
      expect(gen.next().value).toEqual(
        take([identificationSuccess, identificationFailure])
      );
    });

    it('should navigate and dispatch identificationRequest if user says "no"', () => {
      (getPin as jest.Mock).mockReturnValue(O.some("mocked-pin"));

      const action = createAction({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: false
      });

      const gen = handleRefreshSessionToken(action);

      expect(gen.next().value).toEqual(call(dismissSupport));
      expect(gen.next(null).value).toEqual(call(getPin));
      expect(gen.next(O.some("mocked-pin")).value).toEqual(
        put(askUserToRefreshSessionToken.request())
      );
      expect(gen.next().value).toEqual(
        take("ASK_USER_TO_REFRESH_SESSION_TOKEN_SUCCESS")
      );

      const userAction = askUserToRefreshSessionToken.success("no");
      const next = gen.next(userAction).value;

      expect(NavigationService.navigate).toHaveBeenCalledWith(ROUTES.MAIN, {
        screen: MESSAGES_ROUTES.MESSAGES_HOME
      });

      expect(next).toEqual(put(identificationRequest()));
    });

    it("should call doRefreshTokenSaga directly if withUserInteraction is false and pin is present", () => {
      (getPin as jest.Mock).mockReturnValue(O.some("mocked-pin"));

      const action = createAction({
        withUserInteraction: false,
        showIdentificationModalAtStartup: true,
        showLoader: true
      });

      const gen = handleRefreshSessionToken(action);

      expect(gen.next().value).toEqual(call(dismissSupport));
      expect(gen.next(null).value).toEqual(call(getPin));
      expect(gen.next(O.some("mocked-pin")).value).toEqual(
        call(doRefreshTokenSaga, action)
      );
    });

    it("should NOT call doRefreshTokenSaga if identification fails", () => {
      (getPin as jest.Mock).mockReturnValue(O.some("mocked-pin"));

      const action = createAction({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: false
      });

      const gen = handleRefreshSessionToken(action);

      expect(gen.next().value).toEqual(call(dismissSupport));
      expect(gen.next(null).value).toEqual(call(getPin));
      expect(gen.next(O.some("mocked-pin")).value).toEqual(
        put(askUserToRefreshSessionToken.request())
      );
      expect(gen.next().value).toEqual(
        take("ASK_USER_TO_REFRESH_SESSION_TOKEN_SUCCESS")
      );

      const successAction = askUserToRefreshSessionToken.success("yes");
      expect(gen.next(successAction).value).toEqual(
        put(identificationRequest())
      );

      const result = { type: identificationFailure().type };
      const next = gen.next(result).value;

      expect(next).not.toEqual(call(doRefreshTokenSaga, action));
    });

    it("should call doRefreshTokenSaga if identification succeeds", () => {
      (getPin as jest.Mock).mockReturnValue(O.some("mocked-pin"));

      const action = createAction({
        withUserInteraction: true,
        showIdentificationModalAtStartup: false,
        showLoader: false
      });

      const gen = handleRefreshSessionToken(action);

      expect(gen.next().value).toEqual(call(dismissSupport));
      expect(gen.next(null).value).toEqual(call(getPin));
      expect(gen.next(O.some("mocked-pin")).value).toEqual(
        put(askUserToRefreshSessionToken.request())
      );
      expect(gen.next().value).toEqual(
        take("ASK_USER_TO_REFRESH_SESSION_TOKEN_SUCCESS")
      );

      const successAction = askUserToRefreshSessionToken.success("yes");
      expect(gen.next(successAction).value).toEqual(
        put(identificationRequest())
      );

      expect(gen.next().value).toEqual(
        take([identificationSuccess, identificationFailure])
      );

      const result = identificationSuccess({ isBiometric: true });
      expect(gen.next(result).value).toEqual(call(doRefreshTokenSaga, action));
    });
  });

  describe("doRefreshTokenSaga", () => {
    const createAction = (
      payload: typeof RefreshSessionTokenRequestPayload = {
        withUserInteraction: false,
        showIdentificationModalAtStartup: false,
        showLoader: false
      }
    ) => refreshSessionToken.request(payload);

    it("should retry on invalid nonce response", () => {
      const action = createAction();
      const gen = doRefreshTokenSaga(action);

      gen.next(); // showLoader
      gen.next(); // createNonceClient
      const invalidNonceResponse = E.left([]);
      gen.next(invalidNonceResponse); // performGetNonce response

      expect(gen.next().value).toEqual(delay(1000));
    });

    it("should handle session-expired response (403)", () => {
      const action = createAction();
      const gen = doRefreshTokenSaga(action);

      gen.next(); // showLoader
      gen.next(); // createNonceClient

      const response403 = E.right({
        status: 403,
        value: { token: "fake" }
      });

      gen.next(); // performGetNonce
      gen.next(response403); // simulate nonce OK
      gen.next(); // getKeyInfo
      gen.next({}); // keyInfo
      gen.next(); // createFastLoginClient
      gen.next(
        E.right({
          status: 403,
          value: {}
        })
      );

      gen.next(); // delay
    });
  });
  it("should set max-retries when no response is provided", () => {
    const requestState: typeof RequestStateType = {
      counter: fastLoginMaxRetries - 1,
      status: "in-progress",
      error: undefined
    };

    handleRequestError(requestState);

    expect(requestState.status).toBe("max-retries");
    expect(requestState.error).toBe("max retries reached");
  });
});
