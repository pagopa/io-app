import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { AmountEuroCents } from "../../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { WalletLastUsageTypeEnum } from "../../../../../../definitions/pagopa/ecommerce/WalletLastUsageType";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { getNetworkError } from "../../../../../utils/errors";
import { WalletPaymentStepEnum } from "../../types";
import {
  paymentsCalculatePaymentFeesAction,
  paymentsCreateTransactionAction,
  paymentsDeleteTransactionAction,
  paymentsGetPaymentDetailsAction,
  paymentsGetPaymentMethodsAction,
  paymentsGetPaymentTransactionInfoAction,
  paymentsGetPaymentUserMethodsAction,
  paymentsGetRecentPaymentMethodUsedAction,
  paymentsStartPaymentAuthorizationAction
} from "../actions/networking";
import {
  initPaymentStateAction,
  paymentMethodPspBannerClose,
  paymentStartWebViewFlow,
  selectPaymentMethodAction,
  walletPaymentSetCurrentStep
} from "../actions/orchestration";
import { WALLET_PAYMENT_STEP_MAX } from "../reducers";
import { PaymentMethodStatusEnum } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodStatus";
import { TransactionStatusEnum } from "../../../../../../definitions/pagopa/ecommerce/TransactionStatus";

describe("payments checkout reducer index.ts", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  it("should match initial state at startup", () => {
    expect(globalState.features.payments.checkout).toStrictEqual({
      currentStep: WalletPaymentStepEnum.NONE,
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
    });
  });

  it("should handle initPaymentStateAction", () => {
    const store = createStore(appReducer, globalState as any);
    store.dispatch(initPaymentStateAction({}));
    const expectedState = {
      ...globalState.features.payments.checkout,
      currentStep: WalletPaymentStepEnum.NONE,
      selectedWallet: O.none,
      selectedPaymentMethod: O.none,
      selectedPsp: O.none,
      transaction: pot.none,
      authorizationUrl: pot.none
    };
    expect(store.getState().features.payments.checkout).toEqual(expectedState);
  });

  it("should set the current step based on the action for all valid step values", () => {
    const steps = [
      WalletPaymentStepEnum.NONE,
      WalletPaymentStepEnum.PICK_PAYMENT_METHOD,
      WalletPaymentStepEnum.PICK_PSP,
      WalletPaymentStepEnum.CONFIRM_TRANSACTION
    ];

    steps.forEach(step => {
      const store = createStore(appReducer, globalState as any);
      store.dispatch(walletPaymentSetCurrentStep(step));

      // The value should be clamped between 1 and WALLET_PAYMENT_STEP_MAX
      const expectedStep = Math.max(1, Math.min(step, WALLET_PAYMENT_STEP_MAX));

      expect(store.getState().features.payments.checkout.currentStep).toEqual(
        expectedStep
      );
    });
  });

  it("should clamp step values outside the valid range", () => {
    // Test values below and above the valid range
    const testValues = [
      { input: -1, expected: 1 },
      { input: 0, expected: 1 },
      { input: WALLET_PAYMENT_STEP_MAX + 1, expected: WALLET_PAYMENT_STEP_MAX },
      { input: 10, expected: WALLET_PAYMENT_STEP_MAX }
    ];

    testValues.forEach(({ input, expected }) => {
      const store = createStore(appReducer, globalState as any);
      store.dispatch(walletPaymentSetCurrentStep(input));
      expect(store.getState().features.payments.checkout.currentStep).toEqual(
        expected
      );
    });
  });

  it("should handle paymentMethodPspBannerClose", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentMethodPspBannerClose("pspId");
    store.dispatch(action);
    expect(
      store.getState().features.payments.checkout.pspBannerClosed.has("pspId")
    ).toBe(true);
  });

  it("should handle paymentsGetPaymentDetailsAction request", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsGetPaymentDetailsAction.request("rptId" as any);
    store.dispatch(action);
    expect(store.getState().features.payments.checkout).toEqual({
      currentStep: WalletPaymentStepEnum.NONE,
      paymentDetails: pot.noneLoading,
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
      webViewPayload: undefined,
      rptId: "rptId"
    });
  });

  it("should handle paymentsGetPaymentDetailsAction success", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsGetPaymentDetailsAction.success({
      amount: 100 as AmountEuroCents,
      description: "Test payment"
    });
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.paymentDetails).toEqual(
      pot.some({
        amount: 100,
        description: "Test payment"
      })
    );
  });

  it("should handle paymentsGetPaymentDetailsAction failure", () => {
    const store = createStore(appReducer, globalState as any);
    const error = getNetworkError("Network error");
    const action = paymentsGetPaymentDetailsAction.failure(error);
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.paymentDetails).toEqual(
      pot.noneError(error)
    );
  });

  it("should handle paymentsGetPaymentUserMethodsAction request", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsGetPaymentUserMethodsAction.request({});
    store.dispatch(action);
    expect(store.getState().features.payments.checkout).toEqual({
      currentStep: WalletPaymentStepEnum.NONE,
      paymentDetails: pot.none,
      userWallets: pot.noneLoading,
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
    });
  });

  it("should handle paymentsGetPaymentUserMethodsAction success", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsGetPaymentUserMethodsAction.success({
      wallets: []
    });
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.userWallets).toEqual(
      pot.some({
        wallets: []
      })
    );
  });
  it("should handle paymentsGetPaymentUserMethodsAction failure", () => {
    const store = createStore(appReducer, globalState as any);
    const error = getNetworkError("Network error");
    const action = paymentsGetPaymentUserMethodsAction.failure(error);
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.userWallets).toEqual(
      pot.noneError(error)
    );
  });

  it("should handle paymentsGetPaymentMethodsAction request", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsGetPaymentMethodsAction.request({});
    store.dispatch(action);
    expect(store.getState().features.payments.checkout).toEqual({
      currentStep: WalletPaymentStepEnum.NONE,
      paymentDetails: pot.none,
      userWallets: pot.none,
      allPaymentMethods: pot.noneLoading,
      recentUsedPaymentMethod: pot.none,
      pspList: pot.none,
      selectedWallet: O.none,
      selectedPaymentMethod: O.none,
      selectedPsp: O.none,
      transaction: pot.none,
      authorizationUrl: pot.none,
      pspBannerClosed: new Set(),
      webViewPayload: undefined
    });
  });

  it("should handle paymentsGetPaymentMethodsAction success", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsGetPaymentMethodsAction.success({
      paymentMethods: []
    });
    store.dispatch(action);
    expect(
      store.getState().features.payments.checkout.allPaymentMethods
    ).toEqual(
      pot.some({
        paymentMethods: []
      })
    );
  });

  it("should handle paymentsGetPaymentMethodsAction failure", () => {
    const store = createStore(appReducer, globalState as any);
    const error = getNetworkError("Network error");
    const action = paymentsGetPaymentMethodsAction.failure(error);
    store.dispatch(action);
    expect(
      store.getState().features.payments.checkout.allPaymentMethods
    ).toEqual(pot.noneError(error));
  });

  it("should handle paymentsGetRecentPaymentMethodUsedAction request", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsGetRecentPaymentMethodUsedAction.request();
    store.dispatch(action);
    expect(store.getState().features.payments.checkout).toEqual({
      currentStep: WalletPaymentStepEnum.NONE,
      paymentDetails: pot.none,
      userWallets: pot.none,
      allPaymentMethods: pot.none,
      recentUsedPaymentMethod: pot.noneLoading,
      pspList: pot.none,
      selectedWallet: O.none,
      selectedPaymentMethod: O.none,
      selectedPsp: O.none,
      transaction: pot.none,
      authorizationUrl: pot.none,
      pspBannerClosed: new Set(),
      webViewPayload: undefined
    });
  });

  it("should handle paymentsGetRecentPaymentMethodUsedAction success", () => {
    const store = createStore(appReducer, globalState as any);
    const date = new Date("2023-01-01T00:00:00Z");
    const action = paymentsGetRecentPaymentMethodUsedAction.success({
      date,
      walletId: "walletId",
      type: WalletLastUsageTypeEnum.wallet
    });
    store.dispatch(action);
    expect(
      store.getState().features.payments.checkout.recentUsedPaymentMethod
    ).toEqual(
      pot.some({
        date,
        walletId: "walletId",
        type: WalletLastUsageTypeEnum.wallet
      })
    );
  });

  it("should handle paymentsGetRecentPaymentMethodUsedAction failure", () => {
    const store = createStore(appReducer, globalState as any);
    const error = getNetworkError("Network error");
    const action = paymentsGetRecentPaymentMethodUsedAction.failure(error);
    store.dispatch(action);
    expect(
      store.getState().features.payments.checkout.recentUsedPaymentMethod
    ).toEqual(pot.noneError(error));
  });

  it("should handle selectPaymentMethodAction", () => {
    const store = createStore(appReducer, globalState as any);
    store.dispatch(selectPaymentMethodAction({}));
    expect(store.getState().features.payments.checkout).toEqual({
      currentStep: WalletPaymentStepEnum.NONE,
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
    });
  });
  it("should handle paymentsCalculatePaymentFeesAction request", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsCalculatePaymentFeesAction.request({
      paymentAmount: 100 as AmountEuroCents,
      paymentMethodId: "paymentMethodId"
    });
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.pspList).toEqual(
      pot.noneLoading
    );
  });

  it("should handle paymentsCalculatePaymentFeesAction success", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsCalculatePaymentFeesAction.success({
      asset: "asset",
      bundles: [],
      paymentMethodDescription: "description",
      paymentMethodName: "name",
      paymentMethodStatus: PaymentMethodStatusEnum.ENABLED
    });
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.pspList).toEqual(
      pot.some([])
    );
  });

  it("should handle paymentsCalculatePaymentFeesAction failure", () => {
    const store = createStore(appReducer, globalState as any);
    const error = getNetworkError("Network error");
    const action = paymentsCalculatePaymentFeesAction.failure(error);
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.pspList).toEqual(
      pot.noneError(error)
    );
  });

  it("should handle paymentsCalculatePaymentFeesAction cancel", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsCalculatePaymentFeesAction.cancel();
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.pspList).toEqual(
      pot.none
    );
  });

  it("should handle selectPaymentPspAction action", () => {
    const store = createStore(appReducer, globalState as any);
    store.dispatch(selectPaymentMethodAction({}));
    expect(store.getState().features.payments.checkout.selectedPsp).toEqual(
      O.none
    );
  });

  it("should handle paymentsCreateTransactionAction request", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsCreateTransactionAction.request({
      data: {
        paymentNotices: []
      }
    });
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.transaction).toEqual(
      pot.noneLoading
    );
  });

  it("should handle paymentsGetPaymentTransactionInfoAction request", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsGetPaymentTransactionInfoAction.request({
      transactionId: "transactionId"
    });
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.transaction).toEqual(
      pot.noneLoading
    );
  });

  it("should handle paymentsDeleteTransactionAction request", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsDeleteTransactionAction.request("transactionId");
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.transaction).toEqual(
      pot.noneLoading
    );
  });

  it("should handle paymentsCreateTransactionAction success", () => {
    const store = createStore(appReducer, globalState as any);
    const transaction = {
      payments: [],
      status: TransactionStatusEnum.ACTIVATED,
      transactionId: "123"
    };
    const action = paymentsCreateTransactionAction.success(transaction);
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.transaction).toEqual(
      pot.some(transaction)
    );
  });

  it("should handle paymentsGetPaymentTransactionInfoAction success", () => {
    const store = createStore(appReducer, globalState as any);
    const transaction = {
      payments: [],
      status: TransactionStatusEnum.ACTIVATED,
      transactionId: "123"
    };
    const action = paymentsGetPaymentTransactionInfoAction.success({
      payments: [],
      status: TransactionStatusEnum.ACTIVATED,
      transactionId: "123"
    });
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.transaction).toEqual(
      pot.some(transaction)
    );
  });

  it("should handle paymentsDeleteTransactionAction success", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsDeleteTransactionAction.success();
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.transaction).toEqual(
      pot.none
    );
  });

  it("should handle paymentsCreateTransactionAction failure", () => {
    const store = createStore(appReducer, globalState as any);
    const error = getNetworkError("Network error");
    const action = paymentsCreateTransactionAction.failure(error);
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.transaction).toEqual(
      pot.noneError(error)
    );
  });

  it("should handle paymentsGetPaymentTransactionInfoAction failure", () => {
    const store = createStore(appReducer, globalState as any);
    const error = getNetworkError("Network error");
    const action = paymentsGetPaymentTransactionInfoAction.failure(error);
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.transaction).toEqual(
      pot.noneError(error)
    );
  });

  it("should handle paymentsStartPaymentAuthorizationAction request", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsStartPaymentAuthorizationAction.request({
      isAllCCP: false,
      paymentAmount: 100 as AmountEuroCents,
      paymentFees: 10 as AmountEuroCents,
      paymentMethodId: "paymentMethodId",
      pspId: "pspId",
      transactionId: "transactionId"
    });
    store.dispatch(action);
    expect(
      store.getState().features.payments.checkout.authorizationUrl
    ).toEqual(pot.noneLoading);
  });

  it("should handle paymentsStartPaymentAuthorizationAction success", () => {
    const store = createStore(appReducer, globalState as any);
    const authUrl = "https://example.com/auth";
    const action = paymentsStartPaymentAuthorizationAction.success({
      authorizationRequestId: "123",
      authorizationUrl: authUrl
    });
    store.dispatch(action);
    expect(
      store.getState().features.payments.checkout.authorizationUrl
    ).toEqual(pot.some(authUrl));
  });

  it("should handle paymentsStartPaymentAuthorizationAction failure", () => {
    const store = createStore(appReducer, globalState as any);
    const error = getNetworkError("Network error");
    const action = paymentsStartPaymentAuthorizationAction.failure(error);
    store.dispatch(action);
    expect(
      store.getState().features.payments.checkout.authorizationUrl
    ).toEqual(pot.noneError(error));
  });

  it("should handle paymentsStartPaymentAuthorizationAction cancel", () => {
    const store = createStore(appReducer, globalState as any);
    const action = paymentsStartPaymentAuthorizationAction.cancel();
    store.dispatch(action);
    expect(
      store.getState().features.payments.checkout.authorizationUrl
    ).toEqual(pot.none);
  });

  it("should handle paymentStartWebViewFlow", () => {
    const store = createStore(appReducer, globalState as any);
    const webViewPayload = { url: "https://example.com/payment" };
    const action = paymentStartWebViewFlow(webViewPayload);
    store.dispatch(action);
    expect(store.getState().features.payments.checkout.webViewPayload).toEqual(
      webViewPayload
    );
  });
});
