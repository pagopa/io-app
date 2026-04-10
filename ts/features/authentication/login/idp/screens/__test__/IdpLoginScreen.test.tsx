import { createStore } from "redux";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import IdpLoginScreen from "../IdpLoginScreen";
import { AUTHENTICATION_ROUTES } from "../../../../common/navigation/routes";
import * as requestinfo from "../../store/selectors";
import * as IOHooks from "../../../../../../store/hooks";
import * as commonStoreSelector from "../../../../common/store/selectors";
import * as useLollipopLoginSource from "../../../../../lollipop/hooks/useLollipopLoginSource";

jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockNavigate
    })
  };
});

const mockNavigate = jest.fn();

jest.mock("../../../../../../hooks/useHeaderSecondLevel", () => ({
  useHeaderSecondLevel: jest.fn()
}));

describe("IdpLoginScreen", () => {
  const mockDispatch = jest.fn();

  jest.spyOn(IOHooks, "useIODispatch").mockReturnValue(mockDispatch);

  jest.spyOn(useLollipopLoginSource, "useLollipopLoginSource").mockReturnValue({
    lollipopCheckStatus: { status: "none", url: O.none },
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
    jest
      .spyOn(requestinfo, "standardLoginRequestInfoSelector")
      .mockReturnValue({
        requestState: pot.some(true)
      });

    const { getByTestId } = renderComponent();

    expect(getByTestId("webview-idp-login-screen")).toBeTruthy();
  });

  it("should render correctly the loader", () => {
    jest
      .spyOn(requestinfo, "standardLoginRequestInfoSelector")
      .mockReturnValue({
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

    jest
      .spyOn(requestinfo, "standardLoginRequestInfoSelector")
      .mockReturnValue({
        requestState: pot.some(true)
      });

    const { getByTestId } = renderComponent();

    expect(getByTestId("idp-successful-authentication")).toBeTruthy();
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
