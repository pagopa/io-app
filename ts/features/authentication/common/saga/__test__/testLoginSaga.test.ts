import { testSaga } from "redux-saga-test-plan";
import * as E from "fp-ts/lib/Either";
import { PublicKey } from "@pagopa/io-react-native-crypto";
import * as reporters from "@pagopa/ts-commons/lib/reporters";
import { PasswordLogin } from "../../../../../../definitions/session_manager/PasswordLogin";
import { isFastLoginEnabledSelector } from "../../../fastLogin/store/selectors";
import {
  testLoginRequest,
  loginSuccess,
  loginFailure
} from "../../store/actions";
import { handleTestLogin } from "../testLoginSaga";
import { ephemeralPublicKeySelector } from "../../../../lollipop/store/reducers/lollipop";
import {
  isActiveSessionFastLoginEnabledSelector,
  isActiveSessionLoginSelector
} from "../../../activeSessionLogin/store/selectors";

const mockPayload = {
  username: "ABCDEF12G34H567I",
  password: "secret"
} as PasswordLogin;

const mockPublicKey = {
  kty: "RSA",
  alg: "RS256",
  n: "someModulus",
  e: "someExponent"
} satisfies PublicKey;

const mockToken = "mock-token";

const action = testLoginRequest(mockPayload);

// Mock token response
const rightResponse = {
  status: 200,
  value: {
    token: mockToken
  }
};

describe("handleTestLogin saga", () => {
  it("should dispatch loginSuccess on valid response", () => {
    testSaga(handleTestLogin, action)
      .next()
      .select(isFastLoginEnabledSelector)
      .next(false)
      .select(ephemeralPublicKeySelector)
      .next(undefined)
      .select(isActiveSessionFastLoginEnabledSelector)
      .next(false)
      .select(isActiveSessionLoginSelector)
      .next(false)
      .next(E.right(rightResponse))
      .put(
        loginSuccess({
          token: mockToken,
          idp: "test"
        })
      )
      .next()
      .isDone();
  });

  it("should dispatch loginFailure on status !== 200", () => {
    const responseWithError = {
      status: 500,
      value: {}
    };
    testSaga(handleTestLogin, action)
      .next()
      .select(isFastLoginEnabledSelector)
      .next(false)
      .select(ephemeralPublicKeySelector)
      .next(undefined)
      .select(isActiveSessionFastLoginEnabledSelector)
      .next(false)
      .select(isActiveSessionLoginSelector)
      .next(false)
      .next(E.right(responseWithError))
      .put(
        loginFailure({
          error: new Error("response status 500"),
          idp: "test"
        })
      )
      .next()
      .isDone();
  });

  it("should dispatch loginFailure on validation error (E.left)", () => {
    const validationError = E.left([
      {
        value: "errorValue",
        context: []
      }
    ]);
    testSaga(handleTestLogin, action)
      .next()
      .select(isFastLoginEnabledSelector)
      .next(false)
      .select(ephemeralPublicKeySelector)
      .next(undefined)
      .select(isActiveSessionFastLoginEnabledSelector)
      .next(false)
      .select(isActiveSessionLoginSelector)
      .next(false)
      .next(validationError)
      .put(
        loginFailure({
          error: new Error("unknown error"),
          idp: "test"
        })
      )
      .next()
      .isDone();
  });

  it("should dispatch loginFailure on thrown error", () => {
    const error = new Error("oops");
    testSaga(handleTestLogin, action)
      .next()
      .select(isFastLoginEnabledSelector)
      .next(false)
      .select(ephemeralPublicKeySelector)
      .next(undefined)
      .select(isActiveSessionFastLoginEnabledSelector)
      .next(false)
      .select(isActiveSessionLoginSelector)
      .next(false)
      .throw(error)
      .put(
        loginFailure({
          error,
          idp: "test"
        })
      )
      .next()
      .isDone();
  });

  it("should dispatch loginSuccess when lollipop public key is present", () => {
    testSaga(handleTestLogin, action)
      .next()
      .select(isFastLoginEnabledSelector)
      .next(true)
      .select(ephemeralPublicKeySelector)
      .next(mockPublicKey)
      .select(isActiveSessionFastLoginEnabledSelector)
      .next(false)
      .select(isActiveSessionLoginSelector)
      .next(false)
      .next(E.right(rightResponse))
      .put(
        loginSuccess({
          token: mockToken,
          idp: "test"
        })
      )
      .next()
      .isDone();
  });

  it("should extract status code from readableReport in loginFailure", () => {
    const leftWithStatus = E.left([
      {
        context: [],
        value: { message: "Some error", status: 403 }
      }
    ]);

    const mockReadableReport = jest
      .spyOn(reporters, "readableReport")
      .mockReturnValue(`{"status":403,"message":"Some error"}`);

    testSaga(handleTestLogin, action)
      .next()
      .select(isFastLoginEnabledSelector)
      .next(false)
      .select(ephemeralPublicKeySelector)
      .next(undefined)
      .select(isActiveSessionFastLoginEnabledSelector)
      .next(false)
      .select(isActiveSessionLoginSelector)
      .next(false)
      .next(leftWithStatus)
      .put(
        loginFailure({
          error: new Error('"status":403'),
          idp: "test"
        })
      )
      .next()
      .isDone();

    mockReadableReport.mockRestore();
  });
});
