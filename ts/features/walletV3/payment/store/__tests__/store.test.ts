import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { walletPaymentSetCurrentStep } from "../actions/orchestration";
import { WALLET_PAYMENT_STEP_MAX, WalletPaymentState } from "../reducers";

const INITIAL_STATE: WalletPaymentState = {
  currentStep: 1,
  sessionToken: pot.none,
  paymentDetails: pot.none,
  userWallets: pot.none,
  allPaymentMethods: pot.none,
  pspList: pot.none,
  chosenPaymentMethod: O.none,
  chosenPsp: O.none,
  transaction: pot.none,
  authorizationUrl: pot.none
};

describe("Test Wallet reducer", () => {
  it("should have initial state at startup", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.wallet.payment).toStrictEqual(INITIAL_STATE);
  });

  it("should update payment step", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.wallet.payment).toStrictEqual(INITIAL_STATE);

    const store = createStore(appReducer, globalState as any);

    store.dispatch(walletPaymentSetCurrentStep(2));
    expect(store.getState().features.wallet.payment.currentStep).toBe(2);

    store.dispatch(walletPaymentSetCurrentStep(20));
    expect(store.getState().features.wallet.payment.currentStep).toBe(
      WALLET_PAYMENT_STEP_MAX
    );

    store.dispatch(walletPaymentSetCurrentStep(0));
    expect(store.getState().features.wallet.payment.currentStep).toBe(1);
  });
});
