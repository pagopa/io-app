import { Button, Text, Alert } from "react-native";
import { fireEvent } from "@testing-library/react-native";
import { createStore } from "redux";
import { appReducer } from "../../../../store/reducers";
import { renderScreenWithNavigationStoreContext } from "../../../../utils/testWrapper";
import { useOnboardingAbortAlert } from "../useOnboardingAbortAlert";
import * as actions from "../../store/actions";
import { applicationChangeState } from "../../../../store/actions/application";
import { abortOnboarding } from "../../store/actions";
const mockDispatch = jest.fn();

jest.mock("../../../../store/hooks", () => ({
  useIOSelector: jest.fn(),
  useIODispatch: () => mockDispatch,
  useIOStore: jest.fn()
}));

describe("useOnboardingAbortAlert", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
    jest.spyOn(actions, "abortOnboarding").mockReturnValue(abortOnboarding());
  });

  const TestComponent = ({
    withCallback = false
  }: {
    withCallback?: boolean;
  }) => {
    const { showAlert } = useOnboardingAbortAlert();
    return (
      <>
        <Button
          title="show-alert"
          onPress={() =>
            showAlert(withCallback ? () => mockDispatch("CALLBACK") : undefined)
          }
        />
        <Text>Dummy</Text>
      </>
    );
  };

  const renderComponent = (props?: { withCallback?: boolean }) => {
    const initialState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    const store = createStore(appReducer, initialState as any);
    return renderScreenWithNavigationStoreContext(
      () => <TestComponent {...props} />,
      "DUMMY",
      {},
      store
    );
  };

  it("should call Alert.alert with the correct configuration", () => {
    const { getByText } = renderComponent();

    fireEvent.press(getByText("show-alert"));

    expect(Alert.alert).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.arrayContaining([
        expect.objectContaining({ text: expect.any(String), style: "cancel" }),
        expect.objectContaining({
          text: expect.any(String),
          style: "default",
          onPress: expect.any(Function)
        })
      ])
    );
  });

  it("should dispatch abortOnboarding if no callback is provided", () => {
    const { getByText } = renderComponent();

    fireEvent.press(getByText("show-alert"));

    // Simula pressione su "exit"
    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const exitButton = alertButtons?.find(
      (b: { style: string }) => b.style === "default"
    );
    exitButton?.onPress?.();

    expect(mockDispatch).toHaveBeenCalledWith(abortOnboarding());
  });

  it("should call the callback if provided instead of dispatching", () => {
    const { getByText } = renderComponent({ withCallback: true });

    fireEvent.press(getByText("show-alert"));

    const alertButtons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const exitButton = alertButtons?.find(
      (b: { style: string }) => b.style === "default"
    );
    exitButton?.onPress?.();

    expect(mockDispatch).toHaveBeenCalledWith("CALLBACK");
    expect(mockDispatch).not.toHaveBeenCalledWith(abortOnboarding());
  });
});
