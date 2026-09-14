import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import * as IOHooks from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as useOneIdentityLoginSourceModule from "../../../../../lollipop/hooks/useOneIdentityLoginSource";
import { AUTH_ERRORS } from "../../../../common/components/AuthErrorComponent";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import { CALLBACK_PATH } from "../../../../common/utils";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess
} from "../../../store/actions";
import * as activeSessionSelectors from "../../../store/selectors";
import * as useActiveSessionLoginNavigationModule from "../../../utils/useActiveSessionLoginNavigation";
import { OneIdentityActiveSessionIdpLoginScreen } from "../OneIdentityActiveSessionIdpLoginScreen";

jest.mock("react-native-webview", () => {
  const { forwardRef } = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  return {
    WebView: forwardRef((props: object, ref: unknown) => (
      <View ref={ref as never} {...props} />
    ))
  };
});

const mockReplace = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      replace: mockReplace
    })
  };
});

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

jest.mock("../../../../common/analytics", () => ({
  trackLoginFailure: jest.fn(),
  trackSessionTokenSource: jest.fn(),
  trackSessionTokenFragmentFailure: jest.fn()
}));

jest.mock("../../../../common/analytics/spidAnalytics", () => ({
  trackLoginSpidError: jest.fn()
}));

const mockIdp = {
  id: "testidp1",
  name: "testidp1",
  logo: { light: { uri: "" } },
  profileUrl: ""
};

const remoteApiLoginUrlPrefix = "https://api-app.io.pagopa.it";
const callbackUrl = `${remoteApiLoginUrlPrefix}${CALLBACK_PATH}`;

const mockForceLogoutAndNavigateToLanding = jest.fn();

describe("OneIdentityActiveSessionIdpLoginScreen", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);

    jest
      .spyOn(useOneIdentityLoginSourceModule, "useOneIdentityLoginSource")
      .mockReturnValue({
        loginSourceState: {
          status: "one-identity-authorize",
          webviewSource: { uri: "https://example.com/authorize" }
        },
        shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(() => false)
      });

    jest
      .spyOn(activeSessionSelectors, "idpSelectedActiveSessionLoginSelector")
      .mockReturnValue(mockIdp as any);

    jest
      .spyOn(activeSessionSelectors, "activeSessionUserLoggedSelector")
      .mockReturnValue(false);

    jest
      .spyOn(activeSessionSelectors, "remoteApiLoginUrlPrefixSelector")
      .mockReturnValue(remoteApiLoginUrlPrefix);

    jest
      .spyOn(useActiveSessionLoginNavigationModule, "default")
      .mockReturnValue({
        navigateToAuthenticationScreen: jest.fn(),
        navigateToCieCardReaderScreen: jest.fn(),
        navigateToCieConsentDataUsage: jest.fn(),
        forceLogoutAndNavigateToLanding: mockForceLogoutAndNavigateToLanding
      });
  });

  it("should render the loading screen when there is no idpSelected", () => {
    jest
      .spyOn(activeSessionSelectors, "idpSelectedActiveSessionLoginSelector")
      .mockReturnValue(undefined);

    const { getByTestId } = renderComponent();

    expect(getByTestId("LoadingIndicator")).toBeTruthy();
  });

  it("should render the WebView when there is an idpSelected", () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId("webview-idp-login-screen")).toBeTruthy();
  });

  it("should dispatch activeSessionLoginSuccess on a successful login URL", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onShouldStartLoadWithRequest", {
      url: "https://example.com/profile.html#token=session-token"
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      activeSessionLoginSuccess("session-token")
    );
  });

  it("should dispatch activeSessionLoginFailure and navigate to AuthErrorScreen on a failed login URL", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onShouldStartLoadWithRequest", {
      url: "https://example.com/error.html?errorCode=err-code"
    });

    expect(mockDispatch).toHaveBeenCalledWith(activeSessionLoginFailure());

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: "err-code",
        authMethod: "SPID",
        authLevel: "L2"
      }
    });
  });

  it("should not dispatch activeSessionLoginFailure but still navigate to AuthErrorScreen when the failed login URL is the ERROR_1004 case", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onShouldStartLoadWithRequest", {
      url: `https://example.com/error.html?errorCode=${AUTH_ERRORS.ERROR_1004}`
    });

    expect(mockDispatch).not.toHaveBeenCalledWith(activeSessionLoginFailure());

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: AUTH_ERRORS.ERROR_1004,
        authMethod: "SPID",
        authLevel: "L2"
      }
    });
  });

  it("should force logout and navigate to landing on a HTTP error on the callback URL", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onHttpError", {
      nativeEvent: { url: callbackUrl, statusCode: 500 }
    });

    expect(mockForceLogoutAndNavigateToLanding).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should not navigate to AuthErrorScreen on a HTTP 403 error on a non-callback URL", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onHttpError", {
      nativeEvent: { url: "https://example.com/some-path", statusCode: 403 }
    });

    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockForceLogoutAndNavigateToLanding).not.toHaveBeenCalled();
  });

  it("should navigate to AuthErrorScreen on a HTTP error that isn't 403 nor on the callback URL", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onHttpError", {
      nativeEvent: { url: "https://example.com/some-path", statusCode: 500 }
    });

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: undefined,
        authMethod: "SPID",
        authLevel: "L2"
      }
    });
    expect(mockForceLogoutAndNavigateToLanding).not.toHaveBeenCalled();
  });

  it("should navigate to AuthErrorScreen on a generic WebView error", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onError", {
      nativeEvent: { url: "https://example.com/authorize" }
    });

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: undefined,
        authMethod: "SPID",
        authLevel: "L2"
      }
    });
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    OneIdentityActiveSessionIdpLoginScreen,
    AUTHENTICATION_ROUTES.IDP_LOGIN_ACTIVE_SESSION_LOGIN,
    {},
    store
  );
};
