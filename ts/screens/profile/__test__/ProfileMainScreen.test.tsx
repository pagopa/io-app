import { PreloadedState, createStore } from "redux";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider } from "react-redux";
import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Alert } from "react-native";
import { appReducer } from "../../../store/reducers";
import ProfileMainScreen from "../ProfileMainScreen";
import { applicationChangeState } from "../../../store/actions/application";
import { TestInnerNavigationContainer } from "../../../navigation/AppStackNavigator";
import ROUTES from "../../../navigation/routes";
import I18n from "../../../i18n";

jest.spyOn(Alert, "alert");

const TestComponent = () => {
  const Stack = createStackNavigator();
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    appReducer,
    globalState as PreloadedState<ReturnType<typeof appReducer>>
  );

  return (
    <Provider store={store}>
      <TestInnerNavigationContainer>
        <Stack.Navigator initialRouteName={ROUTES.PROFILE_MAIN}>
          <Stack.Screen
            name={ROUTES.PROFILE_MAIN}
            component={ProfileMainScreen}
          />
        </Stack.Navigator>
      </TestInnerNavigationContainer>
    </Provider>
  );
};

describe(ProfileMainScreen, () => {
  it("Should display the alert on logout press", () => {
    const { getByTestId, debug } = render(<TestComponent />);
    debug();
    const logoutButton = getByTestId(/logoutButton/);

    fireEvent.press(logoutButton);

    expect(Alert.alert).toHaveBeenCalledWith(
      I18n.t("profile.logout.alertTitle"),
      I18n.t("profile.logout.alertMessage"),
      [
        {
          text: I18n.t("global.buttons.cancel")
        },
        {
          text: I18n.t("profile.logout.exit"),
          onPress: expect.any(Function)
        }
      ],
      { cancelable: true }
    );
  });
});
