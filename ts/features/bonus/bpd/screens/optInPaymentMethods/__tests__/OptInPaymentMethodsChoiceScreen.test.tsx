import React from "react";
import { NavigationParams } from "react-navigation";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { createStore } from "redux";
import { fireEvent } from "@testing-library/react-native";
import { appReducer } from "../../../../../../store/reducers";
import { renderScreenFakeNavRedux } from "../../../../../../utils/testWrapper";
import OptInPaymentMethodsChoiceScreen from "../OptInPaymentMethodsChoiceScreen";
import { GlobalState } from "../../../../../../store/reducers/types";
import BPD_ROUTES from "../../../navigation/routes";
import I18n from "../../../../../../i18n";

describe("the OptInPaymentMethodsChoiceScreen screen", () => {
  it("should first render with a disabled button", async () => {
    const component = renderComponent();
    const disabledButton = await component.findByTestId(
      "disabledContinueButton"
    );

    expect(disabledButton).toBeTruthy();
  });

  it("should show the activated primary button after selecting the `Keep` option", async () => {
    const component = renderComponent();

    const firstOptionTitle = await component.findByText(
      I18n.t("bonus.bpd.optInPaymentMethods.choice.options.keepAll.title")
    );

    await fireEvent.press(firstOptionTitle);

    const activeButton = await component.findByTestId("continueButton");

    expect(activeButton).toBeTruthy();
  });

  it("should show the red button after selecting the `Delete all` option and a bottom sheet after pressing it", async () => {
    const component = renderComponent();

    const secondOptionTitle = await component.findByText(
      I18n.t("bonus.bpd.optInPaymentMethods.choice.options.deleteAll.title")
    );

    await fireEvent.press(secondOptionTitle);

    const redButton = await component.findByText(
      I18n.t("bonus.bpd.optInPaymentMethods.choice.deleteAllButton")
    );

    expect(redButton).toBeTruthy();

    await fireEvent.press(redButton);

    const bottomSheet = await component.findByText(
      I18n.t(
        "bonus.bpd.optInPaymentMethods.deletePaymentMethodsBottomSheet.title"
      )
    );

    expect(bottomSheet).toBeTruthy();
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
