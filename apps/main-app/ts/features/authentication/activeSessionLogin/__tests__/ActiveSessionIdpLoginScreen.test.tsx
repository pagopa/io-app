import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../store/actions/application";
import * as IOHooks from "../../../../store/hooks";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import * as useLollipopLoginSource from "../../../lollipop/hooks/useLollipopLoginSource";
import { AUTHENTICATION_ROUTES } from "../../common/navigation/routes";
import ActiveSessionIdpLoginScreen from "../screens/spid/ActiveSessionIdpLoginScreen";
import * as activeSessionSelectors from "../store/selectors";

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

const mockNavigate = jest.fn();
const mockReplace = jest.fn();

jest.mock("../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

describe("ActiveSessionIdpLoginScreen", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);

    jest
      .spyOn(useLollipopLoginSource, "useLollipopLoginSource")
      .mockReturnValue({
        lollipopCheckStatus: { status: "none" },
        retryLollipopLogin: jest.fn(),
        shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
        webviewSource: { uri: "https://example.com/login" }
      });

    jest
      .spyOn(activeSessionSelectors, "idpSelectedActiveSessionLoginSelector")
      .mockReturnValue({
        id: "testidp1",
        name: "testidp1",
        logo: { light: { uri: "" } },
        profileUrl: ""
      });

    jest
      .spyOn(activeSessionSelectors, "activeSessionUserLoggedSelector")
      .mockReturnValue(false);
  });

  it("should match snapshots", () => {
    const { toJSON } = renderComponent();
    expect(toJSON()).toMatchSnapshot();
  });

  it("should render correctly the webview", () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId("webview-active-session-idp-login-screen")).toBeTruthy();
  });
  it("should render LoadingSpinnerOverlay when no selectedIdp and no webviewSource", () => {
    jest
      .spyOn(activeSessionSelectors, "idpSelectedActiveSessionLoginSelector")
      .mockReturnValue(undefined);

    jest
      .spyOn(useLollipopLoginSource, "useLollipopLoginSource")
      .mockReturnValue({
        lollipopCheckStatus: { status: "none" },
        retryLollipopLogin: jest.fn(),
        shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
        webviewSource: undefined
      });

    const { getByTestId } = renderComponent();
    expect(getByTestId("overlayComponent")).toBeTruthy();
  });

  it("should render mask loader when requestState is loading", () => {
    const { getByTestId } = renderComponent();
    const webview = getByTestId("webview-active-session-idp-login-screen");
    fireEvent(webview, "onNavigationStateChange", {
      url: "https://example.com/login",
      loading: true
    });
    expect(getByTestId("loading-indicator")).toBeTruthy();
  });

  it("should replace locally with AuthErrorScreen when requestState is error, without touching MAIN", () => {
    const { getByTestId } = renderComponent();

    const webview = getByTestId("webview-active-session-idp-login-screen");
    fireEvent(webview, "onError", {
      nativeEvent: { description: "error" }
    });

    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(
      AUTHENTICATION_ROUTES.AUTH_ERROR_SCREEN,
      {
        errorCodeOrMessage: undefined,
        authMethod: "SPID",
        authLevel: "L2"
      }
    );
  });
});

const renderComponent = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(appReducer, initialState as any);

  return renderScreenWithNavigationStoreContext(
    ActiveSessionIdpLoginScreen,
    AUTHENTICATION_ROUTES.IDP_LOGIN_ACTIVE_SESSION_LOGIN,
    {},
    store
  );
};
