import React from "react";
import { NavigationParams } from "react-navigation";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { createStore } from "redux";
import { fireEvent, waitFor } from "@testing-library/react-native";
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

  it("should show the red button after selecting the `Delete all` option and a bottom sheet after pressing it", () => {
    const component = renderComponent();

    const secondOptionTitle = component.getByText(
      I18n.t("bonus.bpd.optInPaymentMethods.choice.options.deleteAll.title")
    );

    fireEvent.press(secondOptionTitle);

    const redButton = component.getByText(
      I18n.t("bonus.bpd.optInPaymentMethods.choice.deleteAllButton")
    );

    expect(redButton).toBeTruthy();

    fireEvent.press(redButton);

    // This is an hack to use asynchronous code inside
    // jest while using `jest.useFakeTimers()`.
    // See: https://stackoverflow.com/a/51132058/9825478
    void Promise.resolve().then(() => jest.advanceTimersByTime(100));

    return waitFor(() => {
      const bottomSheet = component.getByText(
        I18n.t(
          "bonus.bpd.optInPaymentMethods.deletePaymentMethodsBottomSheet.title"
        )
      );

      expect(bottomSheet).toBeTruthy();
    });
  });
});

const renderComponent = () =>
  renderScreenFakeNavRedux<GlobalState, NavigationParams>(
    () => (
      <BottomSheetModalProvider>
        <OptInPaymentMethodsChoiceScreen />
      </BottomSheetModalProvider>
    ),
    BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CHOICE,
    {},
    createStore(appReducer)
  );
