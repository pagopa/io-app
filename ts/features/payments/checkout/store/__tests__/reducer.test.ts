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
  selectPaymentPspAction,
  walletPaymentSetCurrentStep
} from "../actions/orchestration";
import { WALLET_PAYMENT_STEP_MAX } from "../reducers";
import { PaymentMethodStatusEnum } from "../../../../../../definitions/pagopa/ecommerce/PaymentMethodStatus";
import { TransactionStatusEnum } from "../../../../../../definitions/pagopa/ecommerce/TransactionStatus";

describe("payments checkout reducer index.ts", () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  // Helper function to create test store
  const createTestStore = () => createStore(appReducer, globalState as any);

  /**
   * A utility function to test Redux action patterns for request, success, and failure states.
   *
   * @param actionCreator - An object containing the action creators for request, success, and failure.
   * @param requestParams - The parameters to be passed to the request action creator.
   * @param successParams - The parameters to be passed to the success action creator.
   * @param expectedSuccessState - The expected state after the success action is dispatched.
   * @param stateSelector - A function to select the relevant part of the state for assertions.
   *
   * @example
   * ```typescript
   * testActionPattern(
   *   myActionCreator,
   *   { id: 1 }, // requestParams
   *   { data: "success" }, // successParams
   *   { data: "success", loading: false }, // expectedSuccessState
   *   (state) => state.myFeature // stateSelector
   * );
   * ```
   */
  const testActionPattern = (
    actionCreator: any,
    requestParams: any,
    successParams: any,
    expectedSuccessState: any,
    stateSelector: (state: any) => any
  ) => {
    describe(`${actionCreator.name}`, () => {
      it("should handle request", () => {
        const store = createTestStore();
        store.dispatch(actionCreator.request(requestParams));
        expect(stateSelector(store.getState())).toEqual(pot.noneLoading);
      });

      it("should handle success", () => {
        const store = createTestStore();
        store.dispatch(actionCreator.success(successParams));
        expect(stateSelector(store.getState())).toEqual(expectedSuccessState);
      });

      it("should handle failure", () => {
        const store = createTestStore();
        const error = getNetworkError("Network error");
        store.dispatch(actionCreator.failure(error));
        expect(stateSelector(store.getState())).toEqual(pot.noneError(error));
      });
    });
  };

  // Initial state test
  it("should match initial state at startup", () => {
    const expectedInitialState = {
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
      webViewPayload: undefined,
      contextualPayment: {
        onboardingUrl: pot.none,
        onboardedWalletId: undefined,
        orderId: undefined,
        webViewPayload: undefined
      }
    };
    expect(globalState.features.payments.checkout).toStrictEqual(
      expectedInitialState
    );
  });

  // Orchestration action tests
  describe("Orchestration actions", () => {
    it("should handle initPaymentStateAction", () => {
      const store = createTestStore();
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
      expect(store.getState().features.payments.checkout).toEqual(
        expectedState
      );
    });

    describe("walletPaymentSetCurrentStep", () => {
      it("should set the current step based on the action for all valid step values", () => {
        const steps = [
          WalletPaymentStepEnum.NONE,
          WalletPaymentStepEnum.PICK_PAYMENT_METHOD,
          WalletPaymentStepEnum.PICK_PSP,
          WalletPaymentStepEnum.CONFIRM_TRANSACTION
        ];

        steps.forEach(step => {
          const store = createTestStore();
          store.dispatch(walletPaymentSetCurrentStep(step));
          const expectedStep = Math.max(
            1,
            Math.min(step, WALLET_PAYMENT_STEP_MAX)
          );
          expect(
            store.getState().features.payments.checkout.currentStep
          ).toEqual(expectedStep);
        });
      });

      it("should clamp step values outside the valid range", () => {
        const testValues = [
          { input: -1, expected: 1 },
          { input: 0, expected: 1 },
          {
            input: WALLET_PAYMENT_STEP_MAX + 1,
            expected: WALLET_PAYMENT_STEP_MAX
          },
          { input: 10, expected: WALLET_PAYMENT_STEP_MAX }
        ];

        testValues.forEach(({ input, expected }) => {
          const store = createTestStore();
          store.dispatch(walletPaymentSetCurrentStep(input));
          expect(
            store.getState().features.payments.checkout.currentStep
          ).toEqual(expected);
        });
      });
    });

    it("should handle paymentMethodPspBannerClose", () => {
      const store = createTestStore();
      store.dispatch(paymentMethodPspBannerClose("pspId"));
      expect(
        store.getState().features.payments.checkout.pspBannerClosed.has("pspId")
      ).toBe(true);
    });

    it("should handle paymentStartWebViewFlow", () => {
      const store = createTestStore();
      const webViewPayload = { url: "https://example.com/payment" };
      store.dispatch(paymentStartWebViewFlow(webViewPayload));
      expect(
        store.getState().features.payments.checkout.webViewPayload
      ).toEqual(webViewPayload);
    });

    it("should handle selectPaymentMethodAction", () => {
      const store = createTestStore();
      store.dispatch(selectPaymentMethodAction({}));
      expect(store.getState().features.payments.checkout.selectedPsp).toEqual(
        O.none
      );
    });

    it("should handle selectPaymentPspAction", () => {
      const store = createTestStore();
      const testPsp = { id: "pspId", name: "Test PSP" };
      store.dispatch(selectPaymentPspAction(testPsp));
      expect(store.getState().features.payments.checkout.selectedPsp).toEqual(
        O.some(testPsp)
      );
    });
  });

  // Payment details actions tests
  testActionPattern(
    paymentsGetPaymentDetailsAction,
    "rptId" as any,
    { amount: 100 as AmountEuroCents, description: "Test payment" },
    pot.some({ amount: 100, description: "Test payment" }),
    state => state.features.payments.checkout.paymentDetails
  );

  // User wallets actions tests
  testActionPattern(
    paymentsGetPaymentUserMethodsAction,
    {},
    { wallets: [] },
    pot.some({ wallets: [] }),
    state => state.features.payments.checkout.userWallets
  );

  // Payment methods actions tests
  testActionPattern(
    paymentsGetPaymentMethodsAction,
    {},
    { paymentMethods: [] },
    pot.some({ paymentMethods: [] }),
    state => state.features.payments.checkout.allPaymentMethods
  );

  // Recent payment method actions tests
  describe("paymentsGetRecentPaymentMethodUsedAction", () => {
    it("should handle request", () => {
      const store = createTestStore();
      store.dispatch(paymentsGetRecentPaymentMethodUsedAction.request());
      expect(
        store.getState().features.payments.checkout.recentUsedPaymentMethod
      ).toEqual(pot.noneLoading);
    });

    it("should handle success", () => {
      const store = createTestStore();
      const date = new Date("2023-01-01T00:00:00Z");
      const successData = {
        date,
        walletId: "walletId",
        type: WalletLastUsageTypeEnum.wallet
      };
      store.dispatch(
        paymentsGetRecentPaymentMethodUsedAction.success(successData)
      );
      expect(
        store.getState().features.payments.checkout.recentUsedPaymentMethod
      ).toEqual(pot.some(successData));
    });

    it("should handle failure", () => {
      const store = createTestStore();
      const error = getNetworkError("Network error");
      store.dispatch(paymentsGetRecentPaymentMethodUsedAction.failure(error));
      expect(
        store.getState().features.payments.checkout.recentUsedPaymentMethod
      ).toEqual(pot.noneError(error));
    });
  });

  // Fee calculation actions tests
  describe("paymentsCalculatePaymentFeesAction", () => {
    it("should handle request", () => {
      const store = createTestStore();
      store.dispatch(
        paymentsCalculatePaymentFeesAction.request({
          paymentAmount: 100 as AmountEuroCents,
          paymentMethodId: "paymentMethodId"
        })
      );
      expect(store.getState().features.payments.checkout.pspList).toEqual(
        pot.noneLoading
      );
    });

    it("should handle success", () => {
      const store = createTestStore();
      store.dispatch(
        paymentsCalculatePaymentFeesAction.success({
          asset: "asset",
          bundles: [],
          paymentMethodDescription: "description",
          paymentMethodName: "name",
          paymentMethodStatus: PaymentMethodStatusEnum.ENABLED
        })
      );
      expect(store.getState().features.payments.checkout.pspList).toEqual(
        pot.some([])
      );
    });

    it("should handle failure", () => {
      const store = createTestStore();
      const error = getNetworkError("Network error");
      store.dispatch(paymentsCalculatePaymentFeesAction.failure(error));
      expect(store.getState().features.payments.checkout.pspList).toEqual(
        pot.noneError(error)
      );
    });

    it("should handle cancel", () => {
      const store = createTestStore();
      store.dispatch(paymentsCalculatePaymentFeesAction.cancel());
      expect(store.getState().features.payments.checkout.pspList).toEqual(
        pot.none
      );
    });
  });

  // Transaction actions tests
  describe("Transaction actions", () => {
    describe("Create transaction", () => {
      it("should handle request", () => {
        const store = createTestStore();
        store.dispatch(
          paymentsCreateTransactionAction.request({
            data: { paymentNotices: [] }
          })
        );
        expect(store.getState().features.payments.checkout.transaction).toEqual(
          pot.none
        );
      });

      it("should handle success", () => {
        const store = createTestStore();
        const transaction = {
          payments: [],
          status: TransactionStatusEnum.ACTIVATED,
          transactionId: "123"
        };
        store.dispatch(paymentsCreateTransactionAction.success(transaction));
        expect(store.getState().features.payments.checkout.transaction).toEqual(
          pot.some(transaction)
        );
      });

      it("should handle failure", () => {
        const store = createTestStore();
        const error = getNetworkError("Network error");
        store.dispatch(paymentsCreateTransactionAction.failure(error));
        expect(store.getState().features.payments.checkout.transaction).toEqual(
          pot.noneError(error)
        );
      });
    });

    describe("Get transaction info", () => {
      it("should handle request", () => {
        const store = createTestStore();
        store.dispatch(
          paymentsGetPaymentTransactionInfoAction.request({
            transactionId: "transactionId"
          })
        );
        expect(store.getState().features.payments.checkout.transaction).toEqual(
          pot.noneLoading
        );
      });

      it("should handle success", () => {
        const store = createTestStore();
        const transaction = {
          payments: [],
          status: TransactionStatusEnum.ACTIVATED,
          transactionId: "123"
        };
        store.dispatch(
          paymentsGetPaymentTransactionInfoAction.success(transaction)
        );
        expect(store.getState().features.payments.checkout.transaction).toEqual(
          pot.some(transaction)
        );
      });

      it("should handle failure", () => {
        const store = createTestStore();
        const error = getNetworkError("Network error");
        store.dispatch(paymentsGetPaymentTransactionInfoAction.failure(error));
        expect(store.getState().features.payments.checkout.transaction).toEqual(
          pot.noneError(error)
        );
      });
    });

    describe("Delete transaction", () => {
      it("should handle request", () => {
        const store = createTestStore();
        store.dispatch(
          paymentsDeleteTransactionAction.request("transactionId")
        );
        expect(store.getState().features.payments.checkout.transaction).toEqual(
          pot.noneLoading
        );
      });

      it("should handle success", () => {
        const store = createTestStore();
        store.dispatch(paymentsDeleteTransactionAction.success());
        expect(store.getState().features.payments.checkout.transaction).toEqual(
          pot.none
        );
      });
    });
  });

  // Authorization actions tests
  describe("paymentsStartPaymentAuthorizationAction", () => {
    it("should handle request", () => {
      const store = createTestStore();
      store.dispatch(
        paymentsStartPaymentAuthorizationAction.request({
          isAllCCP: false,
          paymentAmount: 100 as AmountEuroCents,
          paymentFees: 10 as AmountEuroCents,
          paymentMethodId: "paymentMethodId",
          pspId: "pspId",
          transactionId: "transactionId"
        })
      );
      expect(
        store.getState().features.payments.checkout.authorizationUrl
      ).toEqual(pot.noneLoading);
    });

    it("should handle success", () => {
      const store = createTestStore();
      const authUrl = "https://example.com/auth";
      store.dispatch(
        paymentsStartPaymentAuthorizationAction.success({
          authorizationRequestId: "123",
          authorizationUrl: authUrl
        })
      );
      expect(
        store.getState().features.payments.checkout.authorizationUrl
      ).toEqual(pot.some(authUrl));
    });

    it("should handle failure", () => {
      const store = createTestStore();
      const error = getNetworkError("Network error");
      store.dispatch(paymentsStartPaymentAuthorizationAction.failure(error));
      expect(
        store.getState().features.payments.checkout.authorizationUrl
      ).toEqual(pot.noneError(error));
    });

    it("should handle cancel", () => {
      const store = createTestStore();
      store.dispatch(paymentsStartPaymentAuthorizationAction.cancel());
      expect(
        store.getState().features.payments.checkout.authorizationUrl
      ).toEqual(pot.none);
    });
  });
});
