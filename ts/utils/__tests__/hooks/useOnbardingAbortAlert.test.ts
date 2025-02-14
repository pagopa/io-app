import { Alert } from "react-native";
import { createStore } from "redux";
import { useOnboardingAbortAlert } from "../../hooks/useOnboardingAbortAlert";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../testWrapper";
import { abortOnboarding } from "../../../store/actions/onboarding";
import * as dispatch from "../../../store/hooks";

describe("useOnboardingAbortAlert", () => {
  beforeAll(() => {
    jest.spyOn(Alert, "alert");
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should show alert with correct title and description", () => {
    renderHook();

    expect(Alert.alert).toHaveBeenCalledWith(
      "Do you really want to log out?",
      "You will have to log in again to use the app",
      expect.any(Array)
    );
  });

  it("should show alert with correct buttons", () => {
    renderHook();

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    expect(buttons).toHaveLength(2);
    expect(buttons[0].text).toBe("Cancel");
    expect(buttons[0].style).toBe("cancel");
    expect(buttons[1].text).toBe("Exit");
    expect(buttons[1].style).toBe("default");
  });
});

it("should dispatch abortOnboarding action when exit button is pressed", () => {
  const dispatchMock = jest.fn();
  jest.spyOn(dispatch, "useIODispatch").mockReturnValue(dispatchMock);

  renderHook();

  const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
  buttons[1].onPress();
  expect(dispatchMock).toHaveBeenCalledWith(abortOnboarding());
});

const renderHook = (callback?: () => void) => {
  const Component = () => {
    const { showAlert } = useOnboardingAbortAlert();
    showAlert(callback);
    return null;
  };
  const globalState = appReducer(undefined, applicationChangeState("active"));
  return renderScreenWithNavigationStoreContext(
    Component,
    "TEST",
    {},
    createStore(appReducer, globalState as any)
  );
};
