import { IdpData } from "@io-app/api-types/generated/definitions/content/IdpData";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { apiUrlPrefix } from "../../../../../../config";
import { applicationChangeState } from "../../../../../../store/actions/application";
import * as IOHooks from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as useOneIdentityLoginSourceModule from "../../../../../lollipop/hooks/useOneIdentityLoginSource";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import { loginFailure, loginSuccess } from "../../../../common/store/actions";
import * as commonStoreSelector from "../../../../common/store/selectors";
import { OneIdentityIdpLoginScreen } from "../OneIdentityIdpLoginScreen";

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

describe("OneIdentityIdpLoginScreen", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);
    jest
      .spyOn(useOneIdentityLoginSourceModule, "useOneIdentityLoginSource")
      .mockReturnValue({
        loginSourceState: {
          status: "ready",
          webviewSource: { uri: "https://example.com/authorize" }
        },
        shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(() => false)
      });
    jest
      .spyOn(commonStoreSelector, "loggedInAuthSelector")
      .mockReturnValue(undefined);
    jest
      .spyOn(commonStoreSelector, "loggedOutWithIdpAuthSelector")
      .mockReturnValue({
        kind: "LoggedOutWithIdp",
        idp: mockIdp,
        reason: "NOT_LOGGED_IN"
      });
  });

  it("should render the IdpSuccessfulAuthentication screen when logged in", () => {
    jest.spyOn(commonStoreSelector, "loggedInAuthSelector").mockReturnValue({
      kind: "LoggedInWithSessionInfo",
      idp: mockIdp,
      sessionInfo: {},
      sessionToken: "mock-session-token",
      _persist: {
        version: -1,
        rehydrated: true
      }
    });

    const { getByTestId } = renderComponent();

    expect(getByTestId("idp-successful-authentication")).toBeTruthy();
  });

  it("should render the loading screen when there is no loggedOutWithIdpAuth", () => {
    jest
      .spyOn(commonStoreSelector, "loggedOutWithIdpAuthSelector")
      .mockReturnValue(undefined);

    const { getByTestId } = renderComponent();

    expect(getByTestId("LoadingIndicator")).toBeTruthy();
  });

  it("should render the WebView when there is a loggedOutWithIdpAuth", () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId("webview-idp-login-screen")).toBeTruthy();
  });

  it("should dispatch loginSuccess on a successful login URL", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onShouldStartLoadWithRequest", {
      url: "https://example.it/profile.html#token=session-token"
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      loginSuccess({ token: "session-token", idp: mockIdp.id as keyof IdpData })
    );
  });

  it("should dispatch loginFailure and navigate to AuthErrorScreen on a failed login URL", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onShouldStartLoadWithRequest", {
      url: "https://example.it/error.html?errorCode=err-code"
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      loginFailure({
        error: expect.any(Error),
        idp: mockIdp.id as keyof IdpData
      })
    );

    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.MAIN,
      expect.objectContaining({
        screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
        params: expect.objectContaining({ errorCodeOrMessage: "err-code" })
      })
    );
  });

  it("should not navigate to AuthErrorScreen on a HTTP 403 error on the api URL prefix", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onHttpError", {
      nativeEvent: {
        url: `${apiUrlPrefix}/some-path`,
        statusCode: 403
      }
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("should navigate to AuthErrorScreen on a HTTP error that isn't the ignored 403 case", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onHttpError", {
      nativeEvent: {
        url: `${apiUrlPrefix}/some-path`,
        statusCode: 500
      }
    });

    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.MAIN,
      expect.objectContaining({
        screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN
      })
    );
  });

  it("should navigate to AuthErrorScreen on a generic WebView error", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-idp-login-screen");

    fireEvent(webview, "onError", {
      nativeEvent: { url: "https://example.com/authorize" }
    });

    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.MAIN,
      expect.objectContaining({
        screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN
      })
    );
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    OneIdentityIdpLoginScreen,
    AUTHENTICATION_ROUTES.IDP_LOGIN,
    {},
    store
  );
};
