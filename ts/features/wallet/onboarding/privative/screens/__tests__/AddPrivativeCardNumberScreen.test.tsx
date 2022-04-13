import { fireEvent } from "@testing-library/react-native";
import * as React from "react";
import { NavigationActions, NavigationParams } from "react-navigation";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../../../i18n";
import NavigationService from "../../../../../../navigation/NavigationService";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import WALLET_ONBOARDING_PRIVATIVE_ROUTES from "../../navigation/routes";
import {
  walletAddPrivativeCancel,
  walletAddPrivativeInsertCardNumber
} from "../../store/actions";
import AddPrivativeCardNumberScreen from "../AddPrivativeCardNumberScreen";

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

describe("AddPrivativeCardNumberScreen", () => {
  beforeEach(() => jest.useFakeTimers());
  it("Rendering AddPrivativeCardNumberScreen, all the required components should be defined", () => {
    const { component } = renderComponent();

    expect(
      component.queryByTestId("AddPrivativeCardNumberScreen")
    ).not.toBeNull();

    const cancelButton = component.queryByText(I18n.t("global.buttons.cancel"));
    expect(cancelButton).not.toBeNull();

    const confirmButton = component.queryByText(
      I18n.t("global.buttons.continue")
    );
    expect(confirmButton).not.toBeNull();

    const panInputField = component.queryByTestId("PanInputFieldInputMask");
    expect(panInputField).not.toBeNull();
  });
  it("When press on Cancel, should dispatch walletAddPrivativeCancel", () => {
    const { component, store } = renderComponent();
    const cancelButton = component.getByText(I18n.t("global.buttons.cancel"));

    fireEvent.press(cancelButton);
    expect(store.getActions()).toEqual([walletAddPrivativeCancel()]);
  });
  it("On initial state, the continue button should be disabled", () => {
    const { component } = renderComponent();
    const continueButton = component.getByText(
      I18n.t("global.buttons.continue")
    );
    expect(continueButton).toBeDisabled();
  });
  it("After the insertion of the first character in the textinput, the continue button is enabled", () => {
    const { component, store } = renderComponent();
    const continueButton = component.getByText(
      I18n.t("global.buttons.continue")
    );
    const spy = jest.spyOn(NavigationService, "dispatchNavigationAction");

    const panInputField = component.getByTestId("PanInputFieldInputMask");
    expect(panInputField).not.toBeNull();

    fireEvent.changeText(panInputField, "1");
    expect(continueButton).toBeEnabled();
    // Check if the button is now enabled
    fireEvent.press(continueButton);
    expect(store.getActions()).toEqual([
      walletAddPrivativeInsertCardNumber("1")
    ]);
    expect(spy).toHaveBeenCalledWith(
      NavigationActions.navigate({
        routeName: WALLET_ONBOARDING_PRIVATIVE_ROUTES.SEARCH_AVAILABLE
      })
    );

    // removing all the text from the textinput will disable the continue button
    fireEvent.changeText(panInputField, "");
    expect(continueButton).toBeDisabled();
  });
  it("The textInput should allows only 19 digits", () => {
    const { component } = renderComponent();

    const panInputField = component.getByTestId("PanInputFieldInputMask");
    expect(panInputField).not.toBeNull();

    const panNumber = "1234567890123456789000";

    fireEvent.changeText(panInputField, panNumber);
    expect(panInputField).toHaveProp("value", panNumber.slice(0, 19));

    fireEvent.changeText(panInputField, "123-456");
    expect(panInputField).toHaveProp("value", "123456");
    fireEvent.changeText(panInputField, "characters");
    expect(panInputField).toHaveProp("value", "");
  });
});

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState
  } as GlobalState);

  return {
    component: renderScreenFakeNavRedux<GlobalState, NavigationParams>(
      () => <AddPrivativeCardNumberScreen />,
      WALLET_ONBOARDING_PRIVATIVE_ROUTES.INSERT_CARD_NUMBER,
      {},
      store
    ),
    store
  };
};
