import { act, fireEvent } from "@testing-library/react-native";
import { EmitterSubscription, Linking } from "react-native";
import { createStore } from "redux";
import * as O from "fp-ts/lib/Option";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as loginHooks from "../../../lollipop/hooks/useLollipopLoginSource";
import {
  activeSessionLoginFailure,
  activeSessionLoginSuccess,
  setFinishedActiveSessionLoginFlow
} from "../store/actions";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import { SessionToken } from "../../../../types/SessionToken";
import ActiveSessionCieIdLoginScreen from "../screens/cieId/ActiveSessionCieIdLoginScreen";

const API_PREFIX_URL = "http://example.com";
const SPID_LEVEL = "SpidL2";
const IS_UAT = false;

const mockReplace = jest.fn();
const mockDispatch = jest.fn();
const mockPopToTop = jest.fn();

const mockUseHeaderSecondLevel = jest.fn();

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      replace: mockReplace,
      popToTop: mockPopToTop
    }),
    useRoute: () => ({
      params: {
        spidLevel: SPID_LEVEL,
        isUat: IS_UAT
      }
    })
  };
});

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

jest.mock("../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: (...args: Array<any>) =>
    mockUseHeaderSecondLevel(...args)
}));

describe("ActiveSessionCieIdLoginScreen", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should navigate to incorrect url screen on invalid URL format", () => {
    jest
      .spyOn(Linking, "addEventListener")
      .mockImplementation(
        (_: "url", handler: (event: { url: string }) => void) => {
          handler({ url: `iologincie:invalid-url` });
          return { remove: jest.fn() } as unknown as EmitterSubscription;
        }
      );

    renderComponent();

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL,
      params: { url: "invalid-url" }
    });
  });

  it("should dispatch activeSessionLoginSuccess when token is present in URL", () => {
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue({
      lollipopCheckStatus: { status: "none", url: O.none },
      retryLollipopLogin: jest.fn(),
      shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
      webviewSource: { uri: "https://example.com/login" }
    });

    const { getByTestId } = renderComponent();
    const webView = getByTestId("cie-id-webview");

    act(() => {
      fireEvent(webView, "onShouldStartLoadWithRequest", {
        url: `${API_PREFIX_URL}/profile.html?token=my-token`
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      activeSessionLoginSuccess("my-token" as SessionToken)
    );
  });

  it("should dispatch activeSessionLoginFailure and navigate to AUTH_ERROR_SCREEN when error code is in URL", () => {
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue({
      lollipopCheckStatus: { status: "none", url: O.none },
      retryLollipopLogin: jest.fn(),
      shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
      webviewSource: { uri: "https://example.com/login" }
    });

    const { getByTestId } = renderComponent();
    const webView = getByTestId("cie-id-webview");

    act(() => {
      fireEvent(webView, "onShouldStartLoadWithRequest", {
        url: `${API_PREFIX_URL}/error.html?errorCode=invalid_cf`
      });
    });

    expect(mockDispatch).toHaveBeenCalledWith(activeSessionLoginFailure());
    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: expect.objectContaining({
        errorCodeOrMessage: "invalid_cf"
      })
    });
  });

  it("should dispatch setFinishedActiveSessionLoginFlow on goBack", () => {
    renderComponent();

    const capturedProps = mockUseHeaderSecondLevel.mock.calls[0][0];
    expect(capturedProps).toHaveProperty("goBack");

    act(() => {
      capturedProps.goBack();
    });

    expect(mockDispatch).toHaveBeenCalledWith(
      setFinishedActiveSessionLoginFlow()
    );
    expect(mockPopToTop).toHaveBeenCalled();
  });

  it("should navigate to CIE_ID_ERROR when WebView error has no statusCode", () => {
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue({
      webviewSource: { uri: API_PREFIX_URL },
      shouldBlockUrlNavigationWhileCheckingLollipop: () => false,
      lollipopCheckStatus: { status: "none", url: O.none },
      retryLollipopLogin: jest.fn()
    });

    const { getByTestId } = renderComponent();
    const webView = getByTestId("cie-id-webview");

    act(() => {
      fireEvent(webView, "error", {
        nativeEvent: {} // no statusCode
      });
    });

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_ERROR
    });
  });

  it("should navigate to CIE_ID_INCORRECT_URL if URL is not whitelisted", () => {
    const url = "https://evil.com/login";

    jest
      .spyOn(Linking, "addEventListener")
      .mockImplementation(
        (_: "url", handler: (event: { url: string }) => void) => {
          handler({ url: `iologincie:${url}` });
          return { remove: jest.fn() } as unknown as EmitterSubscription;
        }
      );

    renderComponent();

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.CIE_ID_INCORRECT_URL,
      params: { url }
    });
  });

  it("should call handleLoginFailure with message from cieid error URL", () => {
    const message = "Operazione_annullata_dall'utente";
    const url = `https://idserver.servizicie.interno.gov.it/cieiderror?cieid_error_message=${message}`;

    jest
      .spyOn(Linking, "addEventListener")
      .mockImplementation(
        (_: "url", handler: (event: { url: string }) => void) => {
          handler({ url: `iologincie:${url}` });
          return { remove: jest.fn() } as unknown as EmitterSubscription;
        }
      );

    renderComponent();

    expect(mockReplace).toHaveBeenCalledWith(AUTHENTICATION_ROUTES.MAIN, {
      screen: AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      params: expect.objectContaining({
        errorCodeOrMessage: message
      })
    });
  });

  it("should block URL navigation if shouldBlockUrlNavigationWhileCheckingLollipop returns true", () => {
    const blocker = jest.fn().mockReturnValue(true);
    jest.spyOn(loginHooks, "useLollipopLoginSource").mockReturnValue({
      webviewSource: { uri: API_PREFIX_URL },
      shouldBlockUrlNavigationWhileCheckingLollipop: blocker,
      lollipopCheckStatus: { status: "none", url: O.none },
      retryLollipopLogin: jest.fn()
    });

    const { getByTestId } = renderComponent();
    const webView = getByTestId("cie-id-webview");

    const result = webView.props.onShouldStartLoadWithRequest({
      url: `${API_PREFIX_URL}/anything`
    });

    expect(result).toBe(false);
  });
});

function renderComponent() {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, globalState as any);

  return renderScreenWithNavigationStoreContext(
    ActiveSessionCieIdLoginScreen,
    AUTHENTICATION_ROUTES.CIE_ID_ACTIVE_SESSION_LOGIN,
    { spidLevel: SPID_LEVEL, isUat: IS_UAT },
    store
  );
}
