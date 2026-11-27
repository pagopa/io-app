import { render } from "@testing-library/react-native";

import * as useHeaderSecondLevelModule from "../../../../../../hooks/useHeaderSecondLevel";
import ROUTES from "../../../../../../navigation/routes";
import * as IOHooks from "../../../../../../store/hooks";
import { MESSAGES_ROUTES } from "../../../../../messages/navigation/routes";
import { OneIdentityActiveSessionLoginCieAuthorizationWebView } from "../../../../activeSessionLogin/screens/cie/OneIdentityActiveSessionLoginCieAuthorizationWebView";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  logoutBeforeSessionCorrupted,
  setFinishedActiveSessionLoginFlow
} from "../../../../activeSessionLogin/store/actions";
import * as commonAnalytics from "../../../../common/analytics";
import * as cieAnalytics from "../../../../common/analytics/cieAnalytics";
import { CieWebViewLogin } from "../../../../common/components/CieWebViewLogin";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import * as commonUtils from "../../../../common/utils";
import { AUTH_LEVELS, LOGIN_TYPES } from "../../../../common/utils";
import { AUTH_ERRORS } from "../../../../common/utils/authError";
import { LoginFailure } from "../../../../common/utils/loginFailure";
import { OneIdentityCieAuthorizationWebView } from "../OneIdentityCieAuthorizationWebView";

jest.mock("../../../../common/components/CieWebViewLogin", () => ({
  CieWebViewLogin: jest.fn(() => null)
}));

const mockPopTo = jest.fn();
const mockReplace = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      popTo: mockPopTo,
      replace: mockReplace
    })
  };
});

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

jest.mock("../../../../common/analytics", () => ({
  ...jest.requireActual("../../../../common/analytics"),
  trackLoginFailure: jest.fn()
}));

jest.mock("../../../../common/analytics/cieAnalytics", () => ({
  trackLoginCieConsentDataUsageScreen: jest.fn(),
  trackLoginCieDataSharingError: jest.fn()
}));

describe("OneIdentityActiveSessionLoginCieAuthorizationWebView", () => {
  const authorizationUrl = "https://idserver.example.com/authorize";
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);
    jest.spyOn(commonUtils, "isValidCallbackUrl").mockReturnValue(false);
  });

  const renderComponent = () =>
    render(
      <OneIdentityActiveSessionLoginCieAuthorizationWebView
        authorizationUrl={authorizationUrl}
      />
    );

  const getProps = () => jest.mocked(CieWebViewLogin).mock.calls[0][0];

  it("should render CieWebViewLogin with the correct props", () => {
    renderComponent();

    expect(CieWebViewLogin).toHaveBeenCalledWith(
      {
        flow: "reauth",
        url: authorizationUrl,
        onFailure: expect.any(Function),
        onSuccess: expect.any(Function)
      },
      undefined
    );
  });

  it("should track the consent data usage screen for the reauth flow on first render", () => {
    renderComponent();

    expect(
      cieAnalytics.trackLoginCieConsentDataUsageScreen
    ).toHaveBeenCalledWith("reauth");
  });

  it("should dispatch activeSessionLoginSuccess on success", () => {
    renderComponent();

    getProps().onSuccess("session-token");

    expect(mockDispatch).toHaveBeenCalledWith(
      activeSessionLoginSuccess("session-token")
    );
  });

  it("should dispatch activeSessionLoginFailure, track it, and replace with AUTH_ERROR_SCREEN passing L3 level", () => {
    renderComponent();
    const failure: LoginFailure = {
      kind: "backend",
      details: { errorCode: "19", errorMessage: "annullato" }
    };

    getProps().onFailure(failure);

    expect(mockDispatch).toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(commonAnalytics.trackLoginFailure).toHaveBeenCalledWith({
      reason: "login failure with code (19) and message (annullato)",
      idp: "cie",
      flow: "reauth"
    });
    expect(cieAnalytics.trackLoginCieDataSharingError).not.toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      { authMethod: "CIE", authLevel: AUTH_LEVELS.L3, failure }
    );
  });

  it("should NOT dispatch activeSessionLoginFailure for ERROR_1004 (different fiscal code)", () => {
    renderComponent();
    const failure: LoginFailure = {
      kind: "backend",
      details: { errorCode: AUTH_ERRORS.ERROR_1004 }
    };

    getProps().onFailure(failure);

    expect(mockDispatch).not.toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      { authMethod: "CIE", authLevel: AUTH_LEVELS.L3, failure }
    );
  });

  it("should track the data sharing error for ERROR_22", () => {
    renderComponent();

    getProps().onFailure({
      kind: "backend",
      details: { errorCode: AUTH_ERRORS.ERROR_22, errorMessage: "annullato" }
    });

    expect(cieAnalytics.trackLoginCieDataSharingError).toHaveBeenCalledWith(
      "reauth"
    );
  });

  it("should treat a WebView native error as a login failure and replace with AUTH_ERROR_SCREEN", () => {
    renderComponent();
    const failure: LoginFailure = {
      kind: "webViewNative",
      details: {
        code: -2,
        description: "net::ERR_INTERNET_DISCONNECTED",
        url: "https://idserver.example.com/broken"
      }
    };

    getProps().onFailure(failure);

    expect(mockDispatch).toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(commonAnalytics.trackLoginFailure).toHaveBeenCalledWith({
      reason: "webview error (-2)",
      idp: "cie",
      flow: "reauth"
    });
    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      { authMethod: "CIE", authLevel: AUTH_LEVELS.L3, failure }
    );
  });

  it("should force logout and navigate to LANDING on a HTTP error on a callback URL", () => {
    jest.spyOn(commonUtils, "isValidCallbackUrl").mockReturnValue(true);
    renderComponent();

    getProps().onFailure({
      kind: "webViewHttp",
      details: {
        description: "",
        statusCode: 500,
        url: "https://api.example.com/api/auth/v2/callback"
      }
    });

    expect(mockDispatch).toHaveBeenCalledWith(logoutBeforeSessionCorrupted());
    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.LANDING
    });
    expect(mockDispatch).not.toHaveBeenCalledWith(activeSessionLoginFailure());
  });

  it("should ignore a 403 error for a non-callback URL", () => {
    renderComponent();

    getProps().onFailure({
      kind: "webViewHttp",
      details: {
        description: "",
        statusCode: 403,
        url: "https://idserver.example.com/broken"
      }
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should treat any other status code for a non-callback URL as a login failure", () => {
    renderComponent();
    const failure: LoginFailure = {
      kind: "webViewHttp",
      details: {
        description: "",
        statusCode: 500,
        url: "https://idserver.example.com/broken?token=secret"
      }
    };

    getProps().onFailure(failure);

    expect(mockDispatch).toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(commonAnalytics.trackLoginFailure).toHaveBeenCalledWith({
      reason: "webview http error (500)",
      idp: "cie",
      flow: "reauth"
    });
    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      { authMethod: "CIE", authLevel: AUTH_LEVELS.L3, failure }
    );
  });

  it("should dispatch setFinishedActiveSessionLoginFlow and navigate to the messages home on goBack", () => {
    renderComponent();

    const goBackCall = jest
      .mocked(useHeaderSecondLevelModule.useHeaderSecondLevel)
      .mock.calls.at(-1)?.[0];
    goBackCall?.goBack?.();

    expect(mockDispatch).toHaveBeenCalledWith(
      setFinishedActiveSessionLoginFlow()
    );
    expect(mockPopTo).toHaveBeenCalledWith(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  });
});

describe("OneIdentityCieAuthorizationWebView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(jest.fn());
  });

  it("should pass the WebView failure to AUTH_ERROR_SCREEN when the connection drops after the card has been read", () => {
    render(
      <OneIdentityCieAuthorizationWebView
        authorizationUrl="https://idserver.example.com/authorize"
        flow={LOGIN_TYPES.AUTH}
      />
    );
    const { onFailure } = jest.mocked(CieWebViewLogin).mock.calls[0][0];
    const failure: LoginFailure = {
      kind: "webViewNative",
      details: {
        code: -2,
        description: "net::ERR_INTERNET_DISCONNECTED",
        url: "https://idserver.example.com/authorize"
      }
    };

    onFailure(failure);

    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      { authMethod: "CIE", authLevel: AUTH_LEVELS.L3, failure }
    );
  });
});
