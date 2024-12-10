import * as pot from "@pagopa/ts-commons/lib/pot";
import { fireEvent } from "@testing-library/react-native";
import * as O from "fp-ts/lib/Option";
import React from "react";
import { Store } from "redux";
import configureMockStore from "redux-mock-store";
import I18n from "../../../../../i18n";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { PaymentsCheckoutRoutes } from "../../navigation/routes";
import { selectPaymentPspAction } from "../../store/actions/orchestration";
import { PaymentsCheckoutState } from "../../store/reducers";
import { WalletPaymentStepEnum } from "../../types";
import { WalletPaymentPickPspScreen } from "../WalletPaymentPickPspScreen";

describe("WalletPaymentPickPspScreen", () => {
  const mockStore = configureMockStore<GlobalState>();

  const checkout: PaymentsCheckoutState = {
    currentStep: WalletPaymentStepEnum.PICK_PSP,
    pspList: pot.someLoading([
      {
        id: "test"
      }
    ]),
    paymentDetails: pot.none,
    userWallets: pot.none,
    recentUsedPaymentMethod: pot.none,
    allPaymentMethods: pot.none,
    selectedWallet: O.none,
    selectedPaymentMethod: O.none,
    selectedPsp: O.none,
    transaction: pot.none,
    authorizationUrl: pot.none
  };

  const globalState = appReducer(undefined, applicationChangeState("active"));
  const state = {
    ...globalState,
    features: {
      ...globalState.features,
      payments: {
        ...globalState.features.payments,
        checkout
      }
    }
  };

  const renderPspScreen = (store: Store<GlobalState>) =>
    renderScreenWithNavigationStoreContext<GlobalState>(
      () => <WalletPaymentPickPspScreen />,
      PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_MAKE,
      {},
      store
    );

  it("should render the screen", () => {
    const store: ReturnType<typeof mockStore> = mockStore(state);
    const { getByTestId } = renderPspScreen(store);
    expect(getByTestId("wallet-payment-pick-psp-screen")).toBeDefined();
  });

  it("should render with skeleton", () => {
    const store: ReturnType<typeof mockStore> = mockStore({
      ...state,
      features: {
        ...state.features,
        payments: {
          ...state.features.payments,
          checkout: {
            ...checkout,
            pspList: pot.someLoading([])
          }
        }
      }
    });
    const { getByTestId } = renderPspScreen(store);
    expect(getByTestId("wallet-psp-list-skeleton")).toBeDefined();
  });

  it("should render the screen with the continue button disabled", () => {
    const store: ReturnType<typeof mockStore> = mockStore(state);
    const { getByTestId, queryByText } = renderPspScreen(store);
    expect(getByTestId("wallet-payment-pick-psp-screen")).toBeDefined();
    expect(queryByText("wallet-payment-pick-psp-continue-button")).toBeNull();
  });

  it("should render the screen with the continue button enabled", () => {
    const store: ReturnType<typeof mockStore> = mockStore({
      ...state,
      features: {
        ...state.features,
        payments: {
          ...state.features.payments,
          checkout: {
            ...checkout,
            selectedPsp: O.some({
              id: "test"
            })
          }
        }
      }
    });
    const { getByTestId } = renderPspScreen(store);
    expect(getByTestId("wallet-payment-pick-psp-screen")).toBeDefined();
    expect(
      getByTestId("wallet-payment-pick-psp-continue-button")
    ).toBeDefined();
  });

  it("should show bottom sheet", () => {
    const store: ReturnType<typeof mockStore> = mockStore(state);
    const { getByText } = renderPspScreen(store);
    fireEvent.press(getByText(I18n.t("wallet.payment.psp.pspTitle")));
    expect(
      getByText(I18n.t("wallet.payment.psp.sortBottomSheet.default"))
    ).toBeDefined();
  });

  it("should sort by amount", () => {
    const store: ReturnType<typeof mockStore> = mockStore(state);
    const { getByText } = renderPspScreen(store);
    fireEvent.press(getByText(I18n.t("wallet.payment.psp.pspTitle")));
    fireEvent.press(
      getByText(I18n.t("wallet.payment.psp.sortBottomSheet.amount"))
    );
    expect(
      getByText(I18n.t("wallet.payment.psp.sortBottomSheet.amount"))
    ).toBeDefined();
  });

  it("should sort by name", () => {
    const store: ReturnType<typeof mockStore> = mockStore(state);
    const { getByText } = renderPspScreen(store);
    fireEvent.press(getByText(I18n.t("wallet.payment.psp.pspTitle")));
    fireEvent.press(
      getByText(I18n.t("wallet.payment.psp.sortBottomSheet.name"))
    );
    expect(
      getByText(I18n.t("wallet.payment.psp.sortBottomSheet.name"))
    ).toBeDefined();
  });

  it("should select a PSP", () => {
    const store: ReturnType<typeof mockStore> = mockStore({
      ...state,
      features: {
        ...state.features,
        payments: {
          ...state.features.payments,
          checkout: {
            ...checkout,
            pspList: pot.some([
              {
                idBundle: "test",
                pspBusinessName: "Test PSP",
                taxPayerFee: 100
              }
            ])
          }
        }
      }
    });
    const { getByText } = renderPspScreen(store);
    fireEvent.press(getByText("Test PSP"));
    expect(store.getActions()).toContainEqual(
      selectPaymentPspAction({
        idBundle: "test",
        pspBusinessName: "Test PSP",
        taxPayerFee: 100
      })
    );
  });
});
