/* eslint-disable @typescript-eslint/ban-ts-comment */
import { fireEvent, render } from "@testing-library/react-native";
import { Linking } from "react-native";
import CieIdLoginWebView from "../components/CieIdLoginWebView";
import ROUTES from "../../../navigation/routes";
import * as loginHooks from "../../lollipop/hooks/useLollipopLoginSource";
import * as authSelectors from "../../../store/reducers/authentication";
import { SessionToken } from "../../../types/SessionToken";
import { SpidLevelEnum } from "../../../../definitions/session_manager/SpidLevel";
import {
  loginFailure,
  loginSuccess
} from "../../../store/actions/authentication";
import { withStore } from "../../../utils/jest/withStore";

const API_PREFIX_URL = "http://example.com";
const SPID_LEVEL = "SpidL2";
const IS_UAT = false;
const authLoggedIn = {
  kind: "LoggedInWithSessionInfo",
  idp: { id: "", name: "", logo: { light: { uri: "" } }, profileUrl: "" },
  sessionToken: "" as SessionToken,
  sessionInfo: {
    spidLevel: SpidLevelEnum["https://www.spid.gov.it/SpidL2"]
  }
} as ReturnType<typeof authSelectors.loggedInAuthSelector>;

const mockReplace = jest.fn();
const mockDispatch = jest.fn();

jest.mock("@react-navigation/stack", () => ({ createStackNavigator: jest.fn }));
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    replace: mockReplace
  })
}));
jest.mock("../../../config", () => ({
  apiUrlPrefix: API_PREFIX_URL
}));

jest.mock("../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch
}));

jest.mock("react-native-webview", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { View } = require("react-native");

  const WebView = (props: any) => <View {...props} />;

  return {
    WebView,
    default: WebView,
    __esModule: true
  };
});

describe(CieIdLoginWebView, () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  it("Should match the snapshot", () => {
    jest
      .spyOn(Linking, "addEventListener")
      // @ts-ignore
      .mockReturnValue({ remove: jest.fn() });
    const component = renderComponent();
    expect(component).toMatchSnapshot();
  });
  it("Should cancel the operation and navigate to the auth CieID error screen", async () => {
    // @ts-ignore
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue(() => ({
      shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
      webviewSource: undefined
    }));
    const { findByTestId, queryByTestId } = renderComponent();
    const idpScreen = queryByTestId("idp-successful-authentication");
    expect(idpScreen).toBeFalsy();

    const cancelButton = await findByTestId(
      "loadingSpinnerOverlayCancelButton"
    );
    fireEvent.press(cancelButton);

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_CIE_ID_ERROR
    });
  });
  it("Should display the IdpSuccessfulAuthentication screen", () => {
    jest
      .spyOn(authSelectors, "loggedInAuthSelector")
      .mockReturnValue(authLoggedIn);
    const { queryByTestId } = renderComponent();
    const idpScreen = queryByTestId("idp-successful-authentication");

    expect(idpScreen).toBeTruthy();
  });
  it("Should navigate to error screen", () => {
    // @ts-ignore
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue({
      shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
      webviewSource: { uri: API_PREFIX_URL }
    });
    const { getByTestId, queryByTestId } = renderComponent();
    const idpScreen = queryByTestId("idp-successful-authentication");

    expect(idpScreen).toBeFalsy();
    const webView = getByTestId("cie-id-webview");

    fireEvent(webView, "error", { nativeEvent: {} });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_CIE_ID_ERROR
    });
  });
  it("Should trigger onHttpError and execute navigation to error screen", () => {
    // @ts-ignore
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue({
      shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
      webviewSource: { uri: API_PREFIX_URL }
    });
    const { getByTestId, queryByTestId } = renderComponent();
    const idpScreen = queryByTestId("idp-successful-authentication");

    expect(idpScreen).toBeFalsy();
    const webView = getByTestId("cie-id-webview");

    fireEvent(webView, "error", { nativeEvent: { statusCode: 401, url: [] } });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_CIE_ID_ERROR
    });
  });
  it("Should trigger onHttpError without navigating to the error screen", () => {
    // @ts-ignore
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue({
      shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
      webviewSource: { uri: API_PREFIX_URL }
    });
    const { getByTestId, queryByTestId } = renderComponent();
    const idpScreen = queryByTestId("idp-successful-authentication");

    expect(idpScreen).toBeFalsy();
    const webView = getByTestId("cie-id-webview");

    fireEvent(webView, "error", { nativeEvent: { statusCode: 403, url: [] } });
    expect(mockReplace).toHaveBeenCalledTimes(0);
    expect(mockReplace).not.toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_CIE_ID_ERROR
    });
  });
  it("Should trigger onHttpError and navigate to the error screen", () => {
    // @ts-ignore
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue({
      shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
      webviewSource: { uri: API_PREFIX_URL }
    });
    const { getByTestId, queryByTestId } = renderComponent();
    const idpScreen = queryByTestId("idp-successful-authentication");

    expect(idpScreen).toBeFalsy();
    const webView = getByTestId("cie-id-webview");

    fireEvent(webView, "error", {
      nativeEvent: { statusCode: 403, url: [API_PREFIX_URL] }
    });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTHENTICATION_CIE_ID_ERROR
    });
  });
  it("Should trigger an authentication error", () => {
    // @ts-ignore
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue({
      shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
      webviewSource: { uri: API_PREFIX_URL }
    });
    const { getByTestId, queryByTestId } = renderComponent();
    const idpScreen = queryByTestId("idp-successful-authentication");

    expect(idpScreen).toBeFalsy();
    const webView = getByTestId("cie-id-webview");

    fireEvent(webView, "onShouldStartLoadWithRequest", {
      url: `${API_PREFIX_URL}/error.html?errorCode=generic`
    });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      loginFailure({ idp: "cieid", error: expect.any(Error) })
    );
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCodeOrMessage: "generic",
        authMethod: "CIE_ID",
        authLevel: "L2",
        params: { spidLevel: SPID_LEVEL, isUat: IS_UAT }
      }
    });
  });
  it("Should execute the login", () => {
    // @ts-ignore
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue({
      shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
      webviewSource: { uri: API_PREFIX_URL }
    });
    const { getByTestId, queryByTestId } = renderComponent();
    const idpScreen = queryByTestId("idp-successful-authentication");

    expect(idpScreen).toBeFalsy();
    const webView = getByTestId("cie-id-webview");

    fireEvent(webView, "onShouldStartLoadWithRequest", {
      url: `${API_PREFIX_URL}/profile.html?token=my-secret-token`
    });
    expect(mockReplace).toHaveBeenCalledTimes(0);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      loginSuccess({ idp: "cieid", token: "my-secret-token" as SessionToken })
    );
  });
  it("Shouldn't execute the login because of missing token", () => {
    // @ts-ignore
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue({
      shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
      webviewSource: { uri: API_PREFIX_URL }
    });
    const { getByTestId, queryByTestId } = renderComponent();
    const idpScreen = queryByTestId("idp-successful-authentication");

    expect(idpScreen).toBeFalsy();
    const webView = getByTestId("cie-id-webview");

    fireEvent(webView, "onShouldStartLoadWithRequest", {
      url: `${API_PREFIX_URL}/profile.html?token=`
    });
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      loginFailure({ idp: "cieid", error: expect.any(Error) })
    );
    expect(mockReplace).toHaveBeenCalledWith(ROUTES.AUTHENTICATION, {
      screen: ROUTES.AUTH_ERROR_SCREEN,
      params: {
        errorCode: undefined,
        authMethod: "CIE_ID",
        authLevel: "L2",
        params: { spidLevel: SPID_LEVEL, isUat: IS_UAT }
      }
    });
  });
});

function renderComponent() {
  return render(
    withStore(CieIdLoginWebView)({ spidLevel: SPID_LEVEL, isUat: IS_UAT })
  );
}
