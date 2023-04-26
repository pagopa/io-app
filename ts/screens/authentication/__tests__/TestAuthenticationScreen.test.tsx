import { Text } from "react-native";
import { createStore } from "redux";
import { RenderAPI } from "@testing-library/react-native";
import TestAuthenticationScreen from "../TestAuthenticationScreen";
import { GlobalState } from "../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../utils/testWrapper";
import { getTimeoutError } from "../../../utils/errors";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import ROUTES from "../../../navigation/routes";
import { TestLoginState } from "../../../store/reducers/testLogin";
import { getAppVersion } from "../../../utils/appVersion";
import {
  loginFailure,
  loginSuccess,
  testLoginCleanUp,
  testLoginRequest
} from "../../../store/actions/authentication";
import { PasswordLogin } from "../../../../definitions/backend/PasswordLogin";
import { SessionToken } from "../../../types/SessionToken";

const timeoutError = getTimeoutError();

jest.mock("react-native-device-info", () => ({
  getReadableVersion: jest.fn().mockReturnValue("1.2.3.4"),
  getVersion: jest.fn().mockReturnValue("1.2.3.4")
}));

describe("Test TestAuthenticationScreen", () => {
  it(`
    With "idle" state, it should provide the ${getAppVersion()} app version,
    the username and password enabled inputs and a disabled confirm button.
    If a login request is dispatched, 
      it should disable the inputs and show an activity indicator.
    If a login failure is dispatched, 
      it should enable the inputs, hide the activity indicator, and show an error message.
    If a login is successful,
      it should enable the inputs, hide the activity indicator, and show a success message.
    If a login cancel is dispatched, the error and success view should be hidden.
   `, () => {
    const { component, store } = render({
      kind: "idle"
    });

    checkInput(component, "usernameInput", true);
    checkInput(component, "passwordInput", true);

    checkVersionView(component);

    expect(component.queryByTestId("activityIndicator")).toBeNull();

    expect(component.queryByTestId("errorView")).toBeNull();

    const confirmButton = component.queryByTestId("confirmButton");
    expect(confirmButton).not.toBeNull();
    expect(confirmButton).toBeDisabled();

    store.dispatch(
      testLoginRequest({
        username: "username",
        password: "password"
      } as PasswordLogin)
    );

    checkInput(component, "usernameInput", false);
    checkInput(component, "passwordInput", false);
    expect(confirmButton).toBeDisabled();
    expect(component.queryByTestId("activityIndicator")).not.toBeNull();

    const errorMessage = "500 - Internal Server Error";
    store.dispatch(
      loginFailure({
        idp: "test",
        error: new Error(errorMessage)
      })
    );

    checkInput(component, "usernameInput", true);
    checkInput(component, "passwordInput", true);
    expect(component.queryByTestId("activityIndicator")).toBeNull();
    checkErrorView(component, errorMessage);

    store.dispatch(testLoginCleanUp());
    expect(component.queryByTestId("errorView")).toBeNull();

    store.dispatch(
      loginSuccess({
        token: "token" as SessionToken,
        idp: "test"
      })
    );

    checkInput(component, "usernameInput", true);
    checkInput(component, "passwordInput", true);
    expect(component.queryByTestId("activityIndicator")).toBeNull();
    checkSuccessView(component);

    store.dispatch(testLoginCleanUp());
    expect(component.queryByTestId("successView")).toBeNull();
  });

  it(`
    With "requested" state, it should show a loading indicator, 
    the ${getAppVersion()} app version, the username and password disabled inputs 
    and a confirm button
   `, () => {
    const { component } = render({
      kind: "requested"
    });

    checkInput(component, "usernameInput", false);
    checkInput(component, "passwordInput", false);

    checkVersionView(component);

    expect(component.queryByTestId("activityIndicator")).not.toBeNull();

    expect(component.queryByTestId("errorView")).toBeNull();

    expect(component.queryByTestId("confirmButton")).not.toBeNull();
  });

  it(`
    With "failed" state, it should show an error view containing ${
      timeoutError.kind
    },
    the ${getAppVersion()} app version, 
    the username and password disabled inputs and a confirm button
   `, () => {
    const { component } = render({
      kind: "failed",
      errorMessage: timeoutError.kind
    });

    checkInput(component, "usernameInput", true);
    checkInput(component, "passwordInput", true);

    checkVersionView(component);

    expect(component.queryByTestId("activityIndicator")).toBeNull();

    checkErrorView(component, timeoutError.kind);

    expect(component.queryByTestId("confirmButton")).not.toBeNull();
  });

  it(`
    With "success" state, it should show a success view containing "Success",
    the ${getAppVersion()} app version, 
    the username and password enabled inputs and a confirm button
   `, () => {
    const { component } = render({
      kind: "succedeed"
    });

    checkInput(component, "usernameInput", true);
    checkInput(component, "passwordInput", true);

    checkVersionView(component);

    expect(component.queryByTestId("activityIndicator")).toBeNull();

    expect(component.queryByTestId("errorView")).toBeNull();

    checkSuccessView(component);

    expect(component.queryByTestId("confirmButton")).not.toBeNull();
  });
});

const render = (state: TestLoginState) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const testLoginState = {
    ...globalState,
    features: {
      ...globalState.features,
      testLogin: state
    }
  };
  const store = createStore(appReducer, testLoginState as any);
  return {
    component: renderScreenWithNavigationStoreContext<GlobalState>(
      TestAuthenticationScreen,
      ROUTES.AUTHENTICATION_IDP_TEST,
      {},
      store
    ),
    store
  };
};

const checkVersionView = (component: RenderAPI) => {
  const appVersion = component.queryByTestId("appVersion");
  expect(component.queryByTestId("appVersionView")).not.toBeNull();
  expect(appVersion).not.toBeNull();
  expect(appVersion).toHaveTextContent("1.2.3.4");
};

const checkErrorView = (component: RenderAPI, errorMessage: string) => {
  const errorView = component.queryByTestId("errorView");
  expect(errorView).not.toBeNull();
  const texts = errorView?.findAllByType(Text);
  expect(texts).toHaveLength(2);
  expect(texts?.[0]).toHaveTextContent("Error");
  expect(texts?.[1]).toHaveTextContent(errorMessage);
};

const checkSuccessView = (component: RenderAPI) => {
  const successView = component.queryByTestId("successView");
  expect(successView).not.toBeNull();
  const texts2 = successView?.findAllByType(Text);
  expect(texts2).toHaveLength(1);
  expect(texts2?.[0]).toHaveTextContent("Success");
};

const checkInput = (
  component: RenderAPI,
  inputTestID: string,
  enabled: boolean
) => {
  const input = component.queryByTestId(inputTestID);
  expect(input).not.toBeNull();
  if (enabled) {
    expect(input).not.toBeDisabled();
  } else {
    expect(input).toBeDisabled();
  }
};
