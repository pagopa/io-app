import React from "react";
import { NavigationParams } from "react-navigation";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import OptInPaymentMethodsChoiceScreen from "../OptInPaymentMethodsChoiceScreen";
import { GlobalState } from "../../../../../../store/reducers/types";
import BPD_ROUTES from "../../../navigation/routes";
import I18n from "../../../../../../i18n";

jest.useFakeTimers();

describe("the OptInPaymentMethodsChoiceScreen screen", () => {
  it("should first render with a disabled button", () => {
    const component = renderComponent();
    const disabledButton = component.getByTestId("disabledContinueButton");

    expect(disabledButton).toBeTruthy();
  });

  it("should show the activated primary button after selecting the `Keep` option", () => {
    const component = renderComponent();

    const firstOptionTitle = component.getByText(
      I18n.t("bonus.bpd.optInPaymentMethods.choice.options.keepAll.title")
    );

    fireEvent.press(firstOptionTitle);

    const activeButton = component.getByTestId("continueButton");

    expect(activeButton).toBeTruthy();
  });
});

const renderComponent = () =>
  renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => (
        <OptInPaymentMethodsChoiceScreen />
    ),
    BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CHOICE,
    {},
    createStore(appReducer)
  );
