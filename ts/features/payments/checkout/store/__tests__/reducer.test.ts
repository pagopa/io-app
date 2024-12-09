import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { createStore } from "redux";
import { AmountEuroCents } from "../../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import { PaymentMethodStatusEnum } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodStatus";
import { TransactionStatusEnum } from "../../../../../../definitions/pagopa/ecommerce/TransactionStatus";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { getTimeoutError } from "../../../../../utils/errors";
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
  selectPaymentPspAction,
  walletPaymentSetCurrentStep
} from "../actions/orchestration";
import { PaymentsCheckoutState } from "../reducers";
import { RptId } from "../../../../../../definitions/pagopa/ecommerce/RptId";
import { GuestMethodLastUsageTypeEnum } from "../../../../../../definitions/pagopa/ecommerce/GuestMethodLastUsageType";

const INITIAL_STATE: PaymentsCheckoutState = {
  currentStep: WalletPaymentStepEnum.NONE,
  paymentDetails: pot.none,
  userWallets: pot.none,
  recentUsedPaymentMethod: pot.none,
  allPaymentMethods: pot.none,
  pspList: pot.none,
  selectedWallet: O.none,
  selectedPaymentMethod: O.none,
  selectedPsp: O.none,
  transaction: pot.none,
  authorizationUrl: pot.none
};

const networkError = getTimeoutError();

describe("payment checkout reducers", () => {
  it("should match initial state", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    expect(globalState.features.payments.checkout).toStrictEqual(INITIAL_STATE);
  });

  describe("initPaymentStateAction", () => {
    it("should handle initPaymentStateAction", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(initPaymentStateAction({ onSuccess: "showHome" }));
      expect(
        store.getState().features.payments.checkout.onSuccess
      ).toStrictEqual("showHome");
    });
  });

  describe("walletPaymentSetCurrentStep", () => {
    it("should handle walletPaymentSetCurrentStep", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PSP)
      );
      expect(
        store.getState().features.payments.checkout.currentStep
      ).toStrictEqual(WalletPaymentStepEnum.PICK_PSP);
    });
  });

  describe("selectPaymentPspAction", () => {
    it("should handle selectPaymentPspAction", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        walletPaymentSetCurrentStep(WalletPaymentStepEnum.PICK_PSP)
      );
      store.dispatch(
        selectPaymentPspAction({
          abi: "1",
          bundleDescription: "desc"
        })
      );
      expect(
        store.getState().features.payments.checkout.selectedPsp
      ).toStrictEqual(O.some({ abi: "1", bundleDescription: "desc" }));
    });
  });

  describe("paymentsCalculatePaymentFeesAction", () => {
    it("should handle paymentsCalculatePaymentFeesAction request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsCalculatePaymentFeesAction.request({
          paymentAmount: 100,
          paymentMethodId: "123"
        })
      );
      expect(store.getState().features.payments.checkout.pspList).toStrictEqual(
        pot.noneLoading
      );
    });

    it("should handle paymentsCalculatePaymentFeesAction success", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsCalculatePaymentFeesAction.success({
          asset: "EUR",
          bundles: [
            {
              pspBusinessName: "name",
              bundleDescription: "desc",
              bundleName: "name"
            }
          ],
          paymentMethodDescription: "desc",
          paymentMethodName: "name",
          paymentMethodStatus: PaymentMethodStatusEnum.ENABLED
        })
      );
      expect(store.getState().features.payments.checkout.pspList).toStrictEqual(
        pot.some([
          {
            pspBusinessName: "name",
            bundleDescription: "desc",
            bundleName: "name"
          }
        ])
      );
    });

    it("should handle paymentsCalculatePaymentFeesAction failure", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(paymentsCalculatePaymentFeesAction.failure(networkError));
      expect(store.getState().features.payments.checkout.pspList).toStrictEqual(
        pot.noneError(networkError)
      );
    });
  });

  describe("paymentsCreateTransactionAction", () => {
    it("should handle paymentsCreateTransactionAction request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsCreateTransactionAction.request({
          data: {
            paymentNotices: []
          }
        })
      );
      expect(
        store.getState().features.payments.checkout.transaction
      ).toStrictEqual(pot.toLoading(INITIAL_STATE.transaction));
    });

    it("should handle paymentsCreateTransactionAction success", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);

      const data = {
        payments: [],
        transactionId: "123",
        status: TransactionStatusEnum.ACTIVATED,
        authorizationCode: "123"
      };

      store.dispatch(paymentsCreateTransactionAction.success(data));
      expect(
        store.getState().features.payments.checkout.transaction
      ).toStrictEqual(pot.some(data));
    });

    it("should handle paymentsCreateTransactionAction failure", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(paymentsCreateTransactionAction.failure(networkError));
      expect(
        store.getState().features.payments.checkout.transaction
      ).toStrictEqual(pot.noneError(networkError));
    });
  });

  describe("paymentsDeleteTransactionAction", () => {
    it("should handle paymentsDeleteTransactionAction request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(paymentsDeleteTransactionAction.request("123"));
      expect(
        store.getState().features.payments.checkout.transaction
      ).toStrictEqual(pot.toLoading(INITIAL_STATE.transaction));
    });

    it("should handle paymentsDeleteTransactionAction success", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(paymentsDeleteTransactionAction.success());
      expect(
        store.getState().features.payments.checkout.transaction
      ).toStrictEqual(pot.none);
    });

    it("should handle paymentsDeleteTransactionAction failure", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(paymentsDeleteTransactionAction.failure(networkError));
      expect(
        store.getState().features.payments.checkout.transaction
      ).toStrictEqual(pot.noneError(networkError));
    });
  });

  describe("paymentsGetPaymentDetailsAction", () => {
    it("should handle paymentsGetPaymentDetailsAction request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsGetPaymentDetailsAction.request("abc123" as RptId)
      );
      expect(
        store.getState().features.payments.checkout.paymentDetails
      ).toStrictEqual(pot.toLoading(INITIAL_STATE.paymentDetails));
    });

    it("should handle paymentsGetPaymentDetailsAction success", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsGetPaymentDetailsAction.success({
          amount: 100 as AmountEuroCents
        })
      );
      expect(
        store.getState().features.payments.checkout.paymentDetails
      ).toStrictEqual(
        pot.some({
          amount: 100 as AmountEuroCents
        })
      );
    });

    it("should handle paymentsGetPaymentDetailsAction failure", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(paymentsGetPaymentDetailsAction.failure(networkError));
      expect(
        store.getState().features.payments.checkout.paymentDetails
      ).toStrictEqual(pot.noneError(networkError));
    });
  });

  describe("paymentsGetPaymentMethodsAction", () => {
    it("should handle paymentsGetPaymentMethodsAction request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsGetPaymentMethodsAction.request({
          amount: 100
        })
      );
      expect(
        store.getState().features.payments.checkout.allPaymentMethods
      ).toStrictEqual(pot.noneLoading);
    });

    it("should handle paymentsGetPaymentMethodsAction success", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsGetPaymentMethodsAction.success({
          paymentMethods: []
        })
      );
      expect(
        store.getState().features.payments.checkout.allPaymentMethods
      ).toStrictEqual(
        pot.some({
          paymentMethods: []
        })
      );
    });

    it("should handle paymentsGetPaymentMethodsAction failure", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(paymentsGetPaymentMethodsAction.failure(networkError));
      expect(
        store.getState().features.payments.checkout.allPaymentMethods
      ).toStrictEqual(
        pot.toError(INITIAL_STATE.allPaymentMethods, networkError)
      );
    });
  });

  describe("paymentsGetPaymentTransactionInfoAction", () => {
    it("should handle paymentsGetPaymentTransactionInfoAction request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsGetPaymentTransactionInfoAction.request({
          transactionId: "123"
        })
      );
      expect(
        store.getState().features.payments.checkout.transaction
      ).toStrictEqual(pot.toLoading(INITIAL_STATE.transaction));
    });

    it("should handle paymentsGetPaymentTransactionInfoAction success", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsGetPaymentTransactionInfoAction.success({
          payments: [],
          transactionId: "123",
          status: TransactionStatusEnum.ACTIVATED
        })
      );
      expect(
        store.getState().features.payments.checkout.transaction
      ).toStrictEqual(
        pot.some({
          payments: [],
          transactionId: "123",
          status: TransactionStatusEnum.ACTIVATED
        })
      );
    });

    it("should handle paymentsGetPaymentTransactionInfoAction failure", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsGetPaymentTransactionInfoAction.failure(networkError)
      );
      expect(
        store.getState().features.payments.checkout.transaction
      ).toStrictEqual(pot.toError(INITIAL_STATE.transaction, networkError));
    });
  });

  describe("paymentsGetPaymentUserMethodsAction", () => {
    it("should handle paymentsGetPaymentUserMethodsAction request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(paymentsGetPaymentUserMethodsAction.request({}));
      expect(
        store.getState().features.payments.checkout.userWallets
      ).toStrictEqual(pot.noneLoading);
    });

    it("should handle paymentsGetPaymentUserMethodsAction success", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(paymentsGetPaymentUserMethodsAction.success({}));
      expect(
        store.getState().features.payments.checkout.userWallets
      ).toStrictEqual(pot.some({}));
    });

    it("should handle paymentsGetPaymentUserMethodsAction failure", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(paymentsGetPaymentUserMethodsAction.failure(networkError));
      expect(
        store.getState().features.payments.checkout.userWallets
      ).toStrictEqual(pot.toError(INITIAL_STATE.userWallets, networkError));
    });
  });

  describe("paymentsGetRecentPaymentMethodUsedAction", () => {
    it("should handle paymentsGetRecentPaymentMethodUsedAction request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(paymentsGetRecentPaymentMethodUsedAction.request());
      expect(
        store.getState().features.payments.checkout.recentUsedPaymentMethod
      ).toStrictEqual(pot.noneLoading);
    });

    it("should handle paymentsGetRecentPaymentMethodUsedAction success", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsGetRecentPaymentMethodUsedAction.success({
          date: new Date("2020-01-01"),
          paymentMethodId: "123",
          type: GuestMethodLastUsageTypeEnum.guest
        })
      );
      expect(
        store.getState().features.payments.checkout.recentUsedPaymentMethod
      ).toStrictEqual(
        pot.some({
          date: new Date("2020-01-01"),
          paymentMethodId: "123",
          type: GuestMethodLastUsageTypeEnum.guest
        })
      );
    });

    it("should handle paymentsGetRecentPaymentMethodUsedAction failure", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsGetRecentPaymentMethodUsedAction.failure(networkError)
      );
      expect(
        store.getState().features.payments.checkout.recentUsedPaymentMethod
      ).toStrictEqual(
        pot.toError(INITIAL_STATE.recentUsedPaymentMethod, networkError)
      );
    });
  });

  describe("paymentsStartPaymentAuthorizationAction", () => {
    it("should handle paymentsStartPaymentAuthorizationAction request", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);

      const data = {
        isAllCCP: false,
        paymentAmount: 100 as AmountEuroCents,
        paymentMethodId: "123",
        transactionId: "123",
        walletId: "123",
        pspId: "123",
        paymentFees: 100 as AmountEuroCents
      };

      store.dispatch(paymentsStartPaymentAuthorizationAction.request(data));
      expect(store.getState().features.payments.checkout).toStrictEqual({
        ...INITIAL_STATE,
        authorizationUrl: pot.toLoading(INITIAL_STATE.authorizationUrl)
      });
    });

    it("should handle paymentsStartPaymentAuthorizationAction success", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsStartPaymentAuthorizationAction.success({
          authorizationRequestId: "123",
          authorizationUrl: "http://example.com"
        })
      );
      expect(store.getState().features.payments.checkout).toStrictEqual({
        ...INITIAL_STATE,
        authorizationUrl: pot.some("http://example.com")
      });
    });

    it("should handle paymentsStartPaymentAuthorizationAction failure", () => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const store = createStore(appReducer, globalState as any);
      store.dispatch(
        paymentsStartPaymentAuthorizationAction.failure(networkError)
      );
      expect(
        store.getState().features.payments.checkout.authorizationUrl
      ).toStrictEqual(pot.noneError(networkError));
    });
  });
});
