import { Alert } from "react-native";
import { createStore } from "redux";
import { useOnboardingAbortAlert } from "../useOnboardingAbortAlert";
import { appReducer } from "../../../../store/reducers";
import { applicationChangeState } from "../../../../store/actions/application";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { abortOnboarding } from "../../store/actions";
import * as dispatch from "../../../../store/hooks";

describe("useOnboardingAbortAlert", () => {
  beforeEach(() => {
    jest.spyOn(Alert, "alert");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should show alert with correct title and description", () => {
    renderHook();

    expect(Alert.alert).toHaveBeenCalledWith(
      "Vuoi davvero uscire da IO?",
      "Dovrai fare nuovamente il login per continuare ad usare l'app",
      expect.any(Array)
    );
  });

  it("should show alert with correct buttons", () => {
    renderHook();

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    expect(buttons).toHaveLength(2);
    expect(buttons[0].text).toBe("Annulla");
    expect(buttons[0].style).toBe("cancel");
    expect(buttons[1].text).toBe("Esci");
    expect(buttons[1].style).toBe("default");
  });

  it("should dispatch abortOnboarding action when exit button is pressed", () => {
    const dispatchMock = jest.fn();
    jest.spyOn(dispatch, "useIODispatch").mockReturnValue(dispatchMock);

    renderHook();

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    buttons[1].onPress();
    expect(dispatchMock).toHaveBeenCalledWith(abortOnboarding());
  });

  it("should call the provided callback instead of dispatching abortOnboarding action when exit button is pressed", () => {
    const dispatchMock = jest.fn();
    jest.spyOn(dispatch, "useIODispatch").mockReturnValue(dispatchMock);
    const mockCallback = jest.fn();

    renderHook(mockCallback);

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    buttons[1].onPress();
    expect(dispatchMock).not.toHaveBeenCalledWith(abortOnboarding());
    expect(mockCallback).toHaveBeenCalled();
  });
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
