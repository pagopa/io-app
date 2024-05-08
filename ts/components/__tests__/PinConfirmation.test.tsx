import { fireEvent, render } from "@testing-library/react-native";
import React, { memo } from "react";
import { Provider } from "react-redux";
import { PreloadedState, createStore } from "redux";
import { createStackNavigator } from "@react-navigation/stack";
import { Alert } from "react-native";
import { PinConfirmation } from "../PinConfirmation";
import { PinString } from "../../types/PinString";
import { TestInnerNavigationContainer } from "../../navigation/AppStackNavigator";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import ROUTES from "../../navigation/routes";

const mockGoBack = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...(jest.requireActual("@react-navigation/native") as object),
  useNavigation: () => ({
    goBack: mockGoBack
  })
}));

const pin = "162534" as PinString;
const onSubmit = jest.fn();
jest.spyOn(Alert, "alert");

describe("PinConfirmation", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should call onSubmit", () => {
    const { getByTestId } = render(<TestComponent />);

    const codeInput = getByTestId("pin-confirmation-input");

    expect(onSubmit).toHaveBeenCalledTimes(0);

    fireEvent.changeText(codeInput, pin);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(Alert.alert).not.toHaveBeenCalled();
  });
  it("Should call onSubmit", () => {
    const { getByTestId } = render(<TestComponent isOnboarding />);

    const codeInput = getByTestId("pin-confirmation-input");

    expect(onSubmit).toHaveBeenCalledTimes(0);

    fireEvent.changeText(codeInput, pin);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(Alert.alert).not.toHaveBeenCalled();
  });
  it("Should display the Alert on pin mismatch", () => {
    const { getByTestId } = render(<TestComponent />);
    const codeInput = getByTestId("pin-confirmation-input");

    fireEvent.changeText(codeInput, "000000");

    expect(onSubmit).toHaveBeenCalledTimes(0);
    expect(Alert.alert).toHaveBeenCalledWith(
      "I codici inseriti non corrispondono",
      undefined,
      [
        {
          text: "Riprova",
          onPress: mockGoBack
        }
      ]
    );
  });
  it("Should display the Alert on pin mismatch", () => {
    const { getByTestId } = render(<TestComponent isOnboarding />);
    const codeInput = getByTestId("pin-confirmation-input");

    fireEvent.changeText(codeInput, "000000");

    expect(onSubmit).toHaveBeenCalledTimes(0);
    expect(Alert.alert).toHaveBeenCalledWith(
      "I codici inseriti non corrispondono",
      undefined,
      [
        {
          text: "Riprova",
          onPress: mockGoBack
        }
      ]
    );
  });
});

const TestComponent = ({ isOnboarding }: { isOnboarding?: boolean }) => {
  const Stack = createStackNavigator();
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    appReducer,
    globalState as PreloadedState<ReturnType<typeof appReducer>>
  );

  const Component = memo(() => (
    <PinConfirmation
      isOnboarding={isOnboarding}
      pin={pin}
      onSubmit={onSubmit}
    />
  ));

  return (
    <Provider store={store}>
      <TestInnerNavigationContainer>
        <Stack.Navigator
          initialRouteName={
            ROUTES[
              isOnboarding ? "ONBOARDING_CONFIRMATION_PIN" : "PIN_CONFIRMATION"
            ]
          }
        >
          <Stack.Screen
            name={
              ROUTES[
                isOnboarding
                  ? "ONBOARDING_CONFIRMATION_PIN"
                  : "PIN_CONFIRMATION"
              ]
            }
            component={Component}
          />
        </Stack.Navigator>
      </TestInnerNavigationContainer>
    </Provider>
  );
};
