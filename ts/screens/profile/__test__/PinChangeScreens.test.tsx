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
import I18n from "../../../i18n";

describe("PinChangeScreens", () => {
  it("Should navigate to the Profile > PinConfirmation screen", () => {
    const { getByTestId } = render(renderComponent());
    const codeInput = getByTestId(/pin-creation-input/);
    expect(codeInput).not.toBeNull();
    fireEvent.changeText(codeInput, "162534");

    const title = getByTestId(/pin-confirmation-title/);

    expect(title).toHaveTextContent(I18n.t("onboarding.pinConfirmation.title"));
  });
  it("Should display the native Alert", () => {
    const spy = jest.spyOn(Alert, "alert");
    const { getByTestId } = render(renderComponent());
    const codeInput = getByTestId(/pin-creation-input/);
    expect(codeInput).not.toBeNull();

    fireEvent.changeText(codeInput, "111111");

    expect(spy).toHaveBeenCalledWith(
      I18n.t("onboarding.pin.errors.invalid.title"),
      I18n.t("onboarding.pin.errors.invalid.description"),
      [
        {
          text: I18n.t("onboarding.pin.errors.invalid.cta")
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
