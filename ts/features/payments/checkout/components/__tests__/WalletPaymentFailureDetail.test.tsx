import React from "react";
import { createStore } from "redux";
import configureMockStore from "redux-mock-store";
import { fireEvent } from "@testing-library/react-native";
import { WalletPaymentFailure } from "../../types/WalletPaymentFailure";
import { usePaymentFailureSupportModal } from "../../hooks/usePaymentFailureSupportModal";
import { WalletPaymentFailureDetail } from "../WalletPaymentFailureDetail";
import * as analytics from "../../analytics";
import I18n from "../../../../../i18n";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsCheckoutRoutes } from "../../navigation/routes";
import { appReducer } from "../../../../../store/reducers";
import { applicationChangeState } from "../../../../../store/actions/application";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";

jest.mock("../../hooks/usePaymentFailureSupportModal", () => ({
  usePaymentFailureSupportModal: jest.fn()
}));

jest.mock("../../analytics");

const mockNavigation = {
  pop: jest.fn(),
  setOptions: jest.fn()
};
const mockSupportModal = {
  present: jest.fn(),
  bottomSheet: <></>
};

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual<typeof import("@react-navigation/native")>(
    "@react-navigation/native"
  ),
  useNavigation: () => ({ ...mockNavigation })
}));
(usePaymentFailureSupportModal as jest.Mock).mockReturnValue(mockSupportModal);

const globalState = appReducer(undefined, applicationChangeState("active"));
const mockStore = configureMockStore<GlobalState>();
const state = mockStore({
  ...globalState,
  features: {
    ...globalState.features,
    payments: {
      ...globalState.features.payments,
      history: {
        ...globalState.features.payments.history,
        ongoingPayment: {
          rptId: "1234567890" as RptId
        }
      }
    }
  }
});

describe("WalletPaymentFailureDetail", () => {
  const renderComponent = (
    faultCodeCategory: WalletPaymentFailure["faultCodeCategory"]
  ) => {
    const failure: any = {
      faultCodeCategory,
      faultCodeDetail: ""
    };

    const store = createStore(appReducer, state as any);

    return renderScreenWithNavigationStoreContext<GlobalState>(
      () => <WalletPaymentFailureDetail failure={failure} />,
      PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_MAKE,
      {},
      store
    );
  };

  it.each([
    "PAYMENT_UNAVAILABLE",
    "PAYMENT_DATA_ERROR",
    "DOMAIN_UNKNOWN",
    "PAYMENT_ONGOING",
    "PAYMENT_EXPIRED",
    "PAYMENT_CANCELED",
    "PAYMENT_DUPLICATED",
    "PAYMENT_UNKNOWN",
    "PAYMENT_VERIFY_GENERIC_ERROR"
  ] as ReadonlyArray<
    Exclude<
      WalletPaymentFailure["faultCodeCategory"],
      "PAYMENT_GENERIC_ERROR_AFTER_USER_CANCELLATION"
    >
  >)(
    "should render with the right screen props when faultCodeCategory is %p",
    faultCodeCategory => {
      const { getByText } = renderComponent(
        faultCodeCategory as WalletPaymentFailure["faultCodeCategory"]
      );
      expect(
        getByText(I18n.t(`wallet.payment.failure.${faultCodeCategory}.title`))
      ).toBeTruthy();
    }
  );

  it("renders with GENERIC_ERROR fallback props if no specific error code is matched", () => {
    const { getByText } = renderComponent(
      "UNKNOWN_ERROR" as WalletPaymentFailure["faultCodeCategory"]
    );
    expect(
      getByText(I18n.t("wallet.payment.failure.GENERIC_ERROR.title"))
    ).toBeTruthy();
  });

  it("renders with GENERIC_ERROR fallback props if faultCodeCategory is PAYMENT_GENERIC_ERROR_AFTER_USER_CANCELLATION", () => {
    const { getByText } = renderComponent(
      "PAYMENT_GENERIC_ERROR_AFTER_USER_CANCELLATION" as WalletPaymentFailure["faultCodeCategory"]
    );
    expect(
      getByText(I18n.t("wallet.payment.failure.GENERIC_ERROR.title"))
    ).toBeTruthy();
  });

  it.each([
    "PAYMENT_UNAVAILABLE",
    "PAYMENT_DATA_ERROR",
    "DOMAIN_UNKNOWN",
    "PAYMENT_ONGOING",
    "PAYMENT_CANCELED",
    "PAYMENT_VERIFY_GENERIC_ERROR",
    "GENERIC_ERROR"
  ] as ReadonlyArray<WalletPaymentFailure["faultCodeCategory"]>)(
    "renders the contact support button when faultCodeCategory is %p",
    faultCodeCategory => {
      const { getByTestId } = renderComponent(faultCodeCategory);
      expect(getByTestId("wallet-payment-failure-support-button")).toBeTruthy();
    }
  );

  it("calls navigation.pop on press close button when present", () => {
    const { getByTestId } = renderComponent(
      "PAYMENT_UNAVAILABLE" as WalletPaymentFailure["faultCodeCategory"]
    );
    const closeButton = getByTestId("wallet-payment-failure-close-button");
    fireEvent.press(closeButton);
    expect(mockNavigation.pop).toHaveBeenCalled();
  });

  it("presents support modal on press contact support button", () => {
    const { getByTestId } = renderComponent(
      "PAYMENT_UNAVAILABLE" as WalletPaymentFailure["faultCodeCategory"]
    );
    const supportButton = getByTestId("wallet-payment-failure-support-button");
    fireEvent.press(supportButton);
    expect(mockSupportModal.present).toHaveBeenCalled();
  });

  it("tracks payment error analytics on support action", () => {
    const { getByTestId } = renderComponent(
      "PAYMENT_UNAVAILABLE" as WalletPaymentFailure["faultCodeCategory"]
    );
    const supportButton = getByTestId("wallet-payment-failure-support-button");
    fireEvent.press(supportButton);
    expect(analytics.trackPaymentErrorHelp).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "PAYMENT_UNAVAILABLE"
      })
    );
  });

  it("tracks payment request failure analytics on first render when payment faultCodeCategory is DUPLICATED", () => {
    renderComponent(
      "PAYMENT_DUPLICATED" as WalletPaymentFailure["faultCodeCategory"]
    );
    expect(analytics.trackPaymentRequestFailure).toHaveBeenCalledWith(
      expect.objectContaining({
        faultCodeCategory: "PAYMENT_DUPLICATED"
      }),
      expect.any(Object)
    );
  });
});
