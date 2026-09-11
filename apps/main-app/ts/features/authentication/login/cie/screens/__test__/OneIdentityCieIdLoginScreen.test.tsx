import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import * as IOHooks from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as useOneIdentityLoginSourceModule from "../../../../../lollipop/hooks/useOneIdentityLoginSource";
import * as useCieIdAppModule from "../../../../common/hooks/useCieIdApp";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import { loginFailure, loginSuccess } from "../../../../common/store/actions";
import * as commonStoreSelector from "../../../../common/store/selectors";
import { AUTH_LEVELS } from "../../../../common/utils";
import { OneIdentityCieIdLoginScreen } from "../OneIdentityCieIdLoginScreen";

jest.mock("react-native-webview", () => {
  const { forwardRef } = jest.requireActual("react");
  const { View } = jest.requireActual("react-native");
  const WebView = forwardRef((props: object, ref: unknown) => (
    <View ref={ref as never} {...props} />
  ));
  return {
    WebView,
    default: WebView,
    __esModule: true
  };
});

const mockReplace = jest.fn();
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      replace: mockReplace,
      navigate: jest.fn()
    })
  };
});

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

jest.mock("../../../../common/analytics/spidAnalytics", () => ({
  trackLoginSpidError: jest.fn()
}));

jest.mock("../../../../../onboarding/hooks/useOnboardingAbortAlert", () => ({
  useOnboardingAbortAlert: () => ({ showAlert: jest.fn() })
}));

describe("OneIdentityCieIdLoginScreen", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);
    jest
      .spyOn(commonStoreSelector, "loggedInAuthSelector")
      .mockReturnValue(undefined);
    jest
      .spyOn(useOneIdentityLoginSourceModule, "useOneIdentityLoginSource")
      .mockReturnValue({
        loginSourceState: {
          status: "one-identity-authorize",
          webviewSource: { uri: "https://example.com/authorize" }
        },
        shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(() => false)
      });
    jest.spyOn(useCieIdAppModule, "useCieIdApp").mockReturnValue({
      startCieIdApp: jest.fn()
    });
  });

  it("should render the IdpSuccessfulAuthentication screen when logged in", () => {
    jest.spyOn(commonStoreSelector, "loggedInAuthSelector").mockReturnValue({
      kind: "LoggedInWithSessionInfo",
      idp: { id: "cieid", name: "cieid", logo: { light: { uri: "" } } },
      sessionInfo: {},
      sessionToken: "mock-session-token"
    } as any);

    const { getByTestId } = renderComponent();

    expect(getByTestId("idp-successful-authentication")).toBeTruthy();
  });

  it("should render the WebView", () => {
    const { getByTestId } = renderComponent();

    expect(getByTestId("cie-id-webview")).toBeTruthy();
  });

  it("should dispatch loginSuccess on a successful login URL", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("cie-id-webview");

    fireEvent(webview, "onShouldStartLoadWithRequest", {
      url: "https://example.it/profile.html#token=session-token"
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      loginSuccess({ token: "session-token", idp: "cieid" })
    );
  });

  it("should dispatch loginFailure and navigate to AuthErrorScreen on a failed login URL", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("cie-id-webview");

    fireEvent(webview, "onShouldStartLoadWithRequest", {
      url: "https://example.it/error.html?errorCode=err-code"
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      loginFailure({
        error: expect.any(Error),
        idp: "cieid"
      })
    );

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: "err-code",
        authMethod: "CIE_ID",
        authLevel: AUTH_LEVELS.L2,
        params: { spidLevel: AUTH_LEVELS.L2, isUat: false }
      }
    });
  });

  it("should navigate to CIE_ID_INCORRECT_URL when the CieID app returns an untrusted URL", () => {
    renderComponent();

    const { onSuccess } = jest.mocked(useCieIdAppModule.useCieIdApp).mock
      .calls[0][0];
    onSuccess("https://not-whitelisted.example.com");

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL,
      params: { url: "https://not-whitelisted.example.com" }
    });
  });

  it("should navigate to CIE_ID_ERROR on a generic WebView error", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("cie-id-webview");

    fireEvent(webview, "onError", {
      nativeEvent: { url: "https://example.com/authorize" }
    });

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_ERROR
    });
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    OneIdentityCieIdLoginScreen,
    AUTHENTICATION_ROUTES.CIE_ID_LOGIN,
    { spidLevel: AUTH_LEVELS.L2, isUat: false },
    store
  );
};
