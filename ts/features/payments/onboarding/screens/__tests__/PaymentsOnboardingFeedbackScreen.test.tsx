import React from "react";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import configureMockStore from "redux-mock-store";
import { createStore } from "redux";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { WalletOnboardingOutcomeEnum } from "../../types/OnboardingOutcomeEnum";
import { PaymentsOnboardingFeedbackScreen } from "../PaymentsOnboardingFeedbackScreen";
import * as analytics from "../../analytics";
import { getPaymentsWalletUserMethods } from "../../../wallet/store/actions";
import * as hooks from "../../../../../store/hooks";
import {
  selectPaymentOnboardingMethods,
  selectPaymentOnboardingRptIdToResume,
  selectPaymentOnboardingSelectedMethod
} from "../../store/selectors";
import { usePaymentOnboardingAuthErrorBottomSheet } from "../../components/PaymentsOnboardingAuthErrorBottomSheet";
import { usePaymentFailureSupportModal } from "../../../checkout/hooks/usePaymentFailureSupportModal";

jest.mock("../../analytics");

const mockNavigation = {
  popToTop: jest.fn(),
  reset: jest.fn(),
  getParent: jest.fn(() => ({ setOptions: jest.fn() }))
};

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => mockNavigation
}));

jest.mock("../../components/PaymentsOnboardingAuthErrorBottomSheet", () => ({
  usePaymentOnboardingAuthErrorBottomSheet: jest.fn()
}));

jest.mock("../../../checkout/hooks/usePaymentFailureSupportModal", () => ({
  usePaymentFailureSupportModal: jest.fn()
}));

jest.spyOn(hooks, "useIOSelector").mockImplementation(selector => {
  if (selector === selectPaymentOnboardingMethods) {
    return pot.some([{ id: "mock-selected-method-id", name: "Mock Method" }]);
  }
  if (selector === selectPaymentOnboardingSelectedMethod) {
    return "mock-selected-method-id";
  }
  if (selector === selectPaymentOnboardingRptIdToResume) {
    return undefined;
  }
  return undefined;
});

jest.spyOn(hooks, "useIODispatch").mockReturnValue(jest.fn());
const mockBottomSheet = {
  present: jest.fn(),
  bottomSheet: <></>
};
(usePaymentOnboardingAuthErrorBottomSheet as jest.Mock).mockReturnValue(
  mockBottomSheet
);
(usePaymentFailureSupportModal as jest.Mock).mockReturnValue(mockBottomSheet);

const globalState = appReducer(undefined, applicationChangeState("active"));
const mockStore = configureMockStore<GlobalState>();
const state = mockStore(globalState);

const renderComponent = (
  outcome: WalletOnboardingOutcomeEnum,
  walletId?: string
) => {
  const store = createStore(appReducer, state as any);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <PaymentsOnboardingFeedbackScreen />,
    "PAYMENT_ONBOARDING_RESULT_FEEDBACK",
    { outcome, walletId },
    store
  );
};

describe("PaymentsOnboardingFeedbackScreen", () => {
  it("should call navigation.popToTop and fetch user methods on primary action for SUCCESS", () => {
    const { getByTestId } = renderComponent(
      WalletOnboardingOutcomeEnum.SUCCESS,
      "mock-wallet-id"
    );

    const primaryButton = getByTestId("wallet-onboarding-continue-button");
    fireEvent.press(primaryButton);

    expect(mockNavigation.popToTop).toHaveBeenCalled();
    expect(hooks.useIODispatch()).toHaveBeenCalledWith(
      getPaymentsWalletUserMethods.request()
    );
  });

  it("should present a bottom sheet for AUTH_ERROR outcome", () => {
    const { getByTestId } = renderComponent(
      WalletOnboardingOutcomeEnum.AUTH_ERROR
    );
    const secondaryButton = getByTestId(
      "wallet-onboarding-secondary-action-button"
    );

    fireEvent.press(secondaryButton);
    expect(mockBottomSheet.present).toHaveBeenCalled();
  });

  it("should track onboarding analytics on first render", () => {
    const trackAddOnboardingPaymentMethodSpy = jest.spyOn(
      analytics,
      "trackAddOnboardingPaymentMethod"
    );

    renderComponent(WalletOnboardingOutcomeEnum.SUCCESS);
    expect(trackAddOnboardingPaymentMethodSpy).toHaveBeenCalled();
  });

  it.each([
    WalletOnboardingOutcomeEnum.BE_KO,
    WalletOnboardingOutcomeEnum.AUTH_ERROR
  ])("should render secondary actions for outcome %s", outcome => {
    const { getByTestId } = renderComponent(outcome);
    expect(
      getByTestId("wallet-onboarding-secondary-action-button")
    ).toBeTruthy();
  });

  it("should log analytics when contacting support for BE_KO outcome", () => {
    const trackPaymentOnboardingErrorHelpSpy = jest.spyOn(
      analytics,
      "trackPaymentOnboardingErrorHelp"
    );

    const { getByTestId } = renderComponent(WalletOnboardingOutcomeEnum.BE_KO);
    const secondaryButton = getByTestId(
      "wallet-onboarding-secondary-action-button"
    );

    fireEvent.press(secondaryButton);
    expect(trackPaymentOnboardingErrorHelpSpy).toHaveBeenCalledWith({
      error: WalletOnboardingOutcomeEnum.BE_KO,
      payment_method_selected: "Mock Method"
    });
    expect(mockBottomSheet.present).toHaveBeenCalled();
  });
});
