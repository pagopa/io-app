import * as pot from "@pagopa/ts-commons/lib/pot";
import { createStore } from "redux";

import { applicationChangeState } from "../../../../../../store/actions/application";
import * as IOHooks from "../../../../../../store/hooks";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import * as useLollipopLoginSource from "../../../../../lollipop/hooks/useLollipopLoginSource";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import * as commonStoreSelector from "../../../../common/store/selectors";
import * as requestinfo from "../../store/selectors";
import { ErrorType } from "../../store/types";
import IdpLoginScreen from "../IdpLoginScreen";

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

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

describe("IdpLoginScreen", () => {
  const mockDispatch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);

  jest.spyOn(useLollipopLoginSource, "useLollipopLoginSource").mockReturnValue({
    lollipopCheckStatus: { status: "none" },
    retryLollipopLogin: jest.fn(),
    shouldBlockUrlNavigationWhileCheckingLollipop: jest.fn(),
    webviewSource: { uri: "https://example.com/login" }
  });

  jest
    .spyOn(commonStoreSelector, "loggedOutWithIdpAuthSelector")
    .mockReturnValue({
      kind: "LoggedOutWithIdp",
      idp: {
        id: "testidp1",
        name: "testidp1",
        logo: { light: { uri: "" } },
        profileUrl: ""
      },
      reason: "NOT_LOGGED_IN"
    });

  it("should match snapshots", () => {
    const { toJSON } = renderComponent();
    expect(toJSON).toMatchSnapshot();
  });

  it("should render correctly the webview", () => {
    jest.spyOn(requestinfo, "spidLoginRequestInfoSelector").mockReturnValue({
      requestState: pot.some(true)
    });

    const { getByTestId } = renderComponent();

    expect(getByTestId("webview-idp-login-screen")).toBeTruthy();
  });

  it("should render correctly the loader", () => {
    jest.spyOn(requestinfo, "spidLoginRequestInfoSelector").mockReturnValue({
      requestState: pot.toLoading(pot.none)
    });

    const { getByTestId } = renderComponent();

    expect(getByTestId("loading-indicator")).toBeTruthy();
  });

  it("should render success screen if logged in", () => {
    jest.spyOn(commonStoreSelector, "loggedInAuthSelector").mockReturnValue({
      kind: "LoggedInWithoutSessionInfo",
      idp: {
        id: "testidp1",
        name: "testidp1",
        logo: { light: { uri: "" } },
        profileUrl: ""
      },
      sessionToken: "mock-session-token",
      _persist: {
        version: -1,
        rehydrated: true
      }
    });

    jest.spyOn(requestinfo, "spidLoginRequestInfoSelector").mockReturnValue({
      requestState: pot.some(true)
    });

    const { getByTestId } = renderComponent();

    expect(getByTestId("idp-successful-authentication")).toBeTruthy();
  });

  it("should replace locally with AuthErrorScreen when requestState is error, without touching MAIN", () => {
    jest.spyOn(requestinfo, "spidLoginRequestInfoSelector").mockReturnValue({
      requestState: pot.noneError(ErrorType.LOGIN_ERROR)
    });

    renderComponent();

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
    IdpLoginScreen,
    AUTHENTICATION_ROUTES.IDP_LOGIN,
    {},
    store
  );
};
