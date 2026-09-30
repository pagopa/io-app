import { render } from "@testing-library/react-native";

import * as useHeaderSecondLevelModule from "../../../../../../hooks/useHeaderSecondLevel";
import ROUTES from "../../../../../../navigation/routes";
import * as IOHooks from "../../../../../../store/hooks";
import { MESSAGES_ROUTES } from "../../../../../messages/navigation/routes";
import * as commonAnalytics from "../../../../common/analytics";
import * as cieAnalytics from "../../../../common/analytics/cieAnalytics";
import { CieWebViewLogin } from "../../../../common/components/CieWebViewLogin";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import * as commonUtils from "../../../../common/utils";
import { AUTH_LEVELS } from "../../../../common/utils";
import { AUTH_ERRORS } from "../../../../common/utils/authError";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  logoutBeforeSessionCorrupted,
  setFinishedActiveSessionLoginFlow
} from "../../../store/actions";
import { OneIdentityActiveSessionLoginCieAuthorizationWebView } from "../OneIdentityActiveSessionLoginCieAuthorizationWebView";

jest.mock("../../../../common/components/CieWebViewLogin", () => ({
  CieWebViewLogin: jest.fn(() => null)
}));

const mockNavigate = jest.fn();
const mockReplace = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate,
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

  it("should render CieWebViewLogin with the correct props", () => {
    renderComponent();

    expect(CieWebViewLogin).toHaveBeenCalledWith(
      {
        flow: "reauth",
        url: authorizationUrl,
        onEvent: expect.any(Function)
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

  it("should dispatch activeSessionLoginSuccess on LOGIN_SUCCESS event", () => {
    renderComponent();

    const onEvent = jest.mocked(CieWebViewLogin).mock.calls[0][0].onEvent;

    onEvent({
      type: "LOGIN_SUCCESS",
      payload: { token: "session-token" }
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      activeSessionLoginSuccess("session-token")
    );
  });

  it("should dispatch activeSessionLoginFailure, track it, and replace with AUTH_ERROR_SCREEN passing L3 level", () => {
    renderComponent();
    const onEvent = jest.mocked(CieWebViewLogin).mock.calls[0][0].onEvent;

    onEvent({
      type: "LOGIN_FAILURE",
      payload: { code: "19", message: "annullato", reason: "user aborted" }
    });

    expect(mockDispatch).toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(commonAnalytics.trackLoginFailure).toHaveBeenCalledWith({
      reason: "user aborted",
      idp: "cie",
      flow: "reauth"
    });

    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      {
        errorCodeOrMessage: "19",
        authMethod: "CIE",
        authLevel: AUTH_LEVELS.L3
      }
    );
  });

  it("should NOT dispatch activeSessionLoginFailure for ERROR_1004 (different fiscal code)", () => {
    renderComponent();
    const onEvent = jest.mocked(CieWebViewLogin).mock.calls[0][0].onEvent;

    onEvent({
      type: "LOGIN_FAILURE",
      payload: { code: AUTH_ERRORS.ERROR_1004, reason: "fiscalCodeMismatch" }
    });

    expect(mockDispatch).not.toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      {
        errorCodeOrMessage: AUTH_ERRORS.ERROR_1004,
        authMethod: "CIE",
        authLevel: AUTH_LEVELS.L3
      }
    );
  });

  it("should track the data sharing error for ERROR_22", () => {
    renderComponent();
    const onEvent = jest.mocked(CieWebViewLogin).mock.calls[0][0].onEvent;

    onEvent({
      type: "LOGIN_FAILURE",
      payload: {
        code: AUTH_ERRORS.ERROR_22,
        message: "annullato",
        reason: "user aborted"
      }
    });

    expect(cieAnalytics.trackLoginCieDataSharingError).toHaveBeenCalledWith(
      "reauth"
    );
  });

  it("should treat a WEBVIEW_ERROR as a login failure and replace with AUTH_ERROR_SCREEN", () => {
    renderComponent();
    const onEvent = jest.mocked(CieWebViewLogin).mock.calls[0][0].onEvent;

    onEvent({
      type: "WEBVIEW_ERROR",
      payload: { url: "https://idserver.example.com/broken" }
    });

    expect(mockDispatch).toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      {
        errorCodeOrMessage: undefined,
        authMethod: "CIE",
        authLevel: AUTH_LEVELS.L3
      }
    );
  });

  it("should force logout and navigate to LANDING when WEBVIEW_HTTP_ERROR occurs on a callback URL", () => {
    jest.spyOn(commonUtils, "isValidCallbackUrl").mockReturnValue(true);
    renderComponent();
    const onEvent = jest.mocked(CieWebViewLogin).mock.calls[0][0].onEvent;

    onEvent({
      type: "WEBVIEW_HTTP_ERROR",
      payload: {
        url: "https://api.example.com/api/auth/v2/callback",
        statusCode: 500
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
    const onEvent = jest.mocked(CieWebViewLogin).mock.calls[0][0].onEvent;

    onEvent({
      type: "WEBVIEW_HTTP_ERROR",
      payload: { url: "https://idserver.example.com/broken", statusCode: 403 }
    });

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should treat any other status code for a non-callback URL as a login failure", () => {
    renderComponent();
    const onEvent = jest.mocked(CieWebViewLogin).mock.calls[0][0].onEvent;

    onEvent({
      type: "WEBVIEW_HTTP_ERROR",
      payload: { url: "https://idserver.example.com/broken", statusCode: 500 }
    });

    expect(mockDispatch).toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      {
        errorCodeOrMessage: undefined,
        authMethod: "CIE",
        authLevel: AUTH_LEVELS.L3
      }
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
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.MAIN, {
      screen: MESSAGES_ROUTES.MESSAGES_HOME
    });
  });
});
