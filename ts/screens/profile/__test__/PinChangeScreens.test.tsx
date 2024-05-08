import { render, fireEvent } from "@testing-library/react-native";
import React from "react";
import { Provider } from "react-redux";
import { PreloadedState, createStore } from "redux";
import { createStackNavigator } from "@react-navigation/stack";
import { Alert } from "react-native";
import { appReducer } from "../../../store/reducers";
import { applicationChangeState } from "../../../store/actions/application";
import ROUTES from "../../../navigation/routes";
import { TestInnerNavigationContainer } from "../../../navigation/AppStackNavigator";
import PinScreen from "../PinScreen";
import PinConfirmationScreen from "../PinConfirmationScreen";

const mockedGoBack = jest.fn();
jest.spyOn(Alert, "alert");
jest.mock("@react-navigation/native", () => {
  const actualNav = jest.requireActual("@react-navigation/native");
  return {
    ...actualNav,
    useNavigation: () => ({
      ...actualNav.useNavigation(),
      goBack: mockedGoBack
    })
  };
});

describe("PinChangeScreens", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should navigate to the Profile > PinConfirmation screen", () => {
    const { getByTestId } = render(renderComponent());
    const codeInput = getByTestId(/pin-creation-input/);
    expect(codeInput).not.toBeNull();
    fireEvent.changeText(codeInput, "162534");

    const title = getByTestId(/pin-confirmation-title/);

    expect(title).toHaveTextContent("Conferma il codice di sblocco");
  });
  it("Should display the native Alert", () => {
    const { getByTestId } = render(renderComponent());
    const codeInput = getByTestId(/pin-creation-input/);
    expect(codeInput).not.toBeNull();

    fireEvent.changeText(codeInput, "111111");

    expect(Alert.alert).toHaveBeenCalledWith(
      "Il codice non rispetta i criteri di sicurezza",
      "Non deve contenere ripetizione di numeri (es. 000000) e numeri in sequenza (es. 123456 o 654321).",
      [{ text: "Scegli un altro codice" }]
    );
  });
  it("Should display the alert on pin mismatch", () => {
    const { getByTestId } = render(renderComponent());
    const codeInput = getByTestId(/pin-creation-input/);
    expect(codeInput).not.toBeNull();

    fireEvent.changeText(codeInput, "162534");

    /**
     * Confirmation screen
     */
    const confirmationInput = getByTestId(/pin-confirmation-input/);
    fireEvent.changeText(confirmationInput, "111111");

    expect(Alert.alert).toHaveBeenCalledWith(
      "I codici inseriti non corrispondono",
      undefined,
      [
        {
          text: "Riprova",
          onPress: mockedGoBack
        }
      ]
    );
  });
});

function renderComponent() {
  const Stack = createStackNavigator();
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    appReducer,
    globalState as PreloadedState<ReturnType<typeof appReducer>>
  );

  const Screens = () => (
    <Stack.Navigator initialRouteName={ROUTES.PIN_SCREEN}>
      <Stack.Screen name={ROUTES.PIN_SCREEN} component={PinScreen} />
      <Stack.Screen
        name={ROUTES.PIN_CONFIRMATION}
        component={PinConfirmationScreen}
      />
    </Stack.Navigator>
  );

  return (
    <Provider store={store}>
      <TestInnerNavigationContainer>
        <Stack.Navigator initialRouteName={ROUTES.PROFILE_NAVIGATOR}>
          <Stack.Screen name={ROUTES.PROFILE_NAVIGATOR} component={Screens} />
        </Stack.Navigator>
      </TestInnerNavigationContainer>
    </Provider>
  );
}
