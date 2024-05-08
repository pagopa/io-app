/* eslint-disable functional/no-let */
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import { PreloadedState, createStore } from "redux";
import { createStackNavigator } from "@react-navigation/stack";
import { Alert } from "react-native";
import { PinString } from "../../types/PinString";
import { TestInnerNavigationContainer } from "../../navigation/AppStackNavigator";
import { appReducer } from "../../store/reducers";
import { applicationChangeState } from "../../store/actions/application";
import ROUTES from "../../navigation/routes";
import { PinCreation } from "../PinCreation";

const mockedNavigate = jest.fn();
jest.spyOn(Alert, "alert");
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: mockedNavigate
    })
  };
});

const pin = "162534" as PinString;

describe("PinCreation", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Shouldn't call any action", () => {
    const { getByTestId } = render(<TestComponent />);
    const codeInput = getByTestId(/pin-creation-input/);

    fireEvent.changeText(codeInput, "00000");
    expect(mockedNavigate).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });
  it("Should navigate to Profile > PIN_CONFIRMATION", () => {
    const { getByTestId } = render(<TestComponent />);
    const codeInput = getByTestId(/pin-creation-input/);
    fireEvent.changeText(codeInput, pin);

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenLastCalledWith(ROUTES.PROFILE_NAVIGATOR, {
      screen: ROUTES.PIN_CONFIRMATION,
      params: { pin }
    });
  });
  it("Should display the Alert", () => {
    const { getByTestId } = render(<TestComponent />);
    const codeInput = getByTestId(/pin-creation-input/);
    fireEvent.changeText(codeInput, "000000");

    expect(mockedNavigate).not.toHaveBeenCalled();
    expect(Alert.alert).toHaveBeenLastCalledWith(
      "Il codice non rispetta i criteri di sicurezza",
      "Non deve contenere ripetizione di numeri (es. 000000) e numeri in sequenza (es. 123456 o 654321).",
      [{ text: "Scegli un altro codice" }]
    );
  });
  it("Should navigate to Onboarding > ONBOARDIN_CONFIRMATION_PIN", () => {
    const { getByTestId } = render(<TestComponent isOnboarding />);
    const codeInput = getByTestId(/pin-creation-input/);
    fireEvent.changeText(codeInput, pin);

    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledTimes(1);
    expect(mockedNavigate).toHaveBeenLastCalledWith(ROUTES.ONBOARDING, {
      screen: ROUTES.ONBOARDING_CONFIRMATION_PIN,
      params: { pin }
    });
  });
});

const TestComponent = ({ isOnboarding }: { isOnboarding?: boolean }) => {
  const Stack = createStackNavigator();
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    appReducer,
    globalState as PreloadedState<ReturnType<typeof appReducer>>
  );

  const Component = () => <PinCreation isOnboarding={isOnboarding} />;

  return (
    <Provider store={store}>
      <TestInnerNavigationContainer>
        <Stack.Navigator
          initialRouteName={
            ROUTES[isOnboarding ? "ONBOARDING_PIN" : "PIN_SCREEN"]
          }
        >
          <Stack.Screen
            name={ROUTES[isOnboarding ? "ONBOARDING_PIN" : "PIN_SCREEN"]}
            component={Component}
          />
        </Stack.Navigator>
      </TestInnerNavigationContainer>
    </Provider>
  );
};
