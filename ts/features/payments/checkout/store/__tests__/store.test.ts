import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { walletPaymentSetCurrentStep } from "../actions/orchestration";
import { PaymentsCheckoutState } from "../reducers";

const INITIAL_STATE: PaymentsCheckoutState = {
  currentStep: 0,
  paymentDetails: pot.none,
  userWallets: pot.none,
  allPaymentMethods: pot.none,
  recentUsedPaymentMethod: pot.none,
  pspList: pot.none,
  selectedWallet: O.none,
  selectedPaymentMethod: O.none,
  selectedPsp: O.none,
  transaction: pot.none,
  authorizationUrl: pot.none,
  pspBannerClosed: new Set(),
  webViewPayload: undefined
};

describe("Test Payment reducer", () => {
  it("should have initial state at startup", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.payments.checkout).toStrictEqual(INITIAL_STATE);
  });

  it("should correctly update payment step, also when trying to overflow the steps, it should set the steps to WALLET_PAYMENT_STEP_MAX, and in case zero is passed it should set the step to 1", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.payments.checkout).toStrictEqual(INITIAL_STATE);

    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletPaymentSetCurrentStep(2));
    expect(store.getState().features.payments.checkout.currentStep).toBe(2);

    store.dispatch(walletPaymentSetCurrentStep(0));
    expect(store.getState().features.payments.checkout.currentStep).toBe(1);
  });
});
