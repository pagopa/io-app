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
const spy = jest.spyOn(Alert, "alert");

describe("PinConfirmation", () => {
  it("Should call onSubmit", () => {
    const { getByTestId } = renderComponent();

    const codeInput = getByTestId("pin-confirmation-input");

    expect(onSubmit).toHaveBeenCalledTimes(0);

    fireEvent.changeText(codeInput, pin);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(spy).not.toHaveBeenCalled();
    onSubmit.mockReset();
  });
  it("Should display the Alert on pin mismatch", () => {
    const { getByTestId } = renderComponent();
    const codeInput = getByTestId("pin-confirmation-input");

    fireEvent.changeText(codeInput, "000000");

    expect(onSubmit).toHaveBeenCalledTimes(0);

    /**
     * SpyOn seems to trigger mocked functions twice.
     */
    expect(spy).toHaveBeenCalledWith(
      "I codici inseriti non corrispondono",
      undefined,
      [
        {
          text: "Riprova",
          onPress: mockGoBack
        }
      ]
    );

    spy.mockRestore();
  });
});

const Component = memo(() => <PinConfirmation pin={pin} onSubmit={onSubmit} />);

const renderComponent = () => {
  const Stack = createStackNavigator();
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const store = createStore(
    appReducer,
    globalState as PreloadedState<ReturnType<typeof appReducer>>
  );

  return render(
    <Provider store={store}>
      <TestInnerNavigationContainer>
        <Stack.Navigator initialRouteName={ROUTES.PIN_CONFIRMATION}>
          <Stack.Screen name={ROUTES.PIN_CONFIRMATION} component={Component} />
        </Stack.Navigator>
      </TestInnerNavigationContainer>
    </Provider>
  );
};
