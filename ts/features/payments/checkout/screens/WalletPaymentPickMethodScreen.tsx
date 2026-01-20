import { H2, IOToast, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import { sequenceT } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { useState, useCallback, useEffect, useRef } from "react";
import { Millisecond } from "@pagopa/ts-commons/lib/units";
import { AccessibilityInfo, View } from "react-native";
import I18n from "i18next";
import { IOScrollView } from "../../../../components/ui/IOScrollView";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { PaymentAnalyticsSelectedMethodFlag } from "../../common/types/PaymentAnalytics";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import * as analytics from "../analytics";
import {
  CheckoutPaymentMethodsList,
  CheckoutPaymentMethodsListSkeleton
} from "../components/CheckoutPaymentMethodsList";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import {
  paymentsCalculatePaymentFeesAction,
  paymentsCreateTransactionAction,
  paymentsGetContextualOnboardingUrlAction,
  paymentsGetPaymentMethodsAction,
  paymentsGetPaymentTransactionInfoAction,
  paymentsGetRecentPaymentMethodUsedAction
} from "../store/actions/networking";
import {
  selectPaymentsOrderId,
  selectWalletPaymentCurrentStep,
  walletPaymentAmountSelector,
  walletPaymentDetailsSelector
} from "../store/selectors";
import {
  walletPaymentAllMethodsSelector,
  walletPaymentContextualOnboardingUrlSelector,
  walletPaymentEnabledUserWalletsSelector,
  walletPaymentSelectedPaymentMethodIdOptionSelector,
  walletPaymentSelectedPaymentMethodOptionSelector,
  walletPaymentSelectedWalletIdOptionSelector
} from "../store/selectors/paymentMethods";
import { walletPaymentPspListSelector } from "../store/selectors/psps";
import {
  walletPaymentIsTransactionActivatedSelector,
  walletPaymentTransactionSelector
} from "../store/selectors/transaction";
import { FaultCodeCategoryEnum } from "../../../../../definitions/pagopa/ecommerce/GatewayFaultPaymentProblemJson";
import { setAccessibilityFocus } from "../../../../utils/accessibility";
import { WalletPaymentStepEnum } from "../types";
import { PAYMENT_STEPS_TOTAL_PAGES } from "../utils";
import { AmountEuroCents } from "../../../../../definitions/pagopa/ecommerce/AmountEuroCents";
import {
  useWalletOnboardingWebView,
  WalletOnboardingOutcomeParams
} from "../../onboarding/hooks/useWalletOnboardingWebView";
import { WalletOnboardingOutcomeEnum } from "../../onboarding/types/OnboardingOutcomeEnum";
import { PaymentsOnboardingRoutes } from "../../onboarding/navigation/routes";
import { paymentClearWebViewFlow } from "../store/actions/orchestration.ts";

const WalletPaymentPickMethodScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const titleRef = useRef<View>(null);

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const paymentAmountPot = useIOSelector(walletPaymentAmountSelector);
  const paymentMethodsPot = useIOSelector(walletPaymentAllMethodsSelector);
  const userWalletsPots = useIOSelector(
    walletPaymentEnabledUserWalletsSelector
  );
  const contextualPaymentOrderId = useIOSelector(selectPaymentsOrderId);
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const isTransactionAlreadyActivated = useIOSelector(
    walletPaymentIsTransactionActivatedSelector
  );
  const pspListPot = useIOSelector(walletPaymentPspListSelector);
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

  const selectedWalletIdOption = useIOSelector(
    walletPaymentSelectedWalletIdOptionSelector
  );
  const selectedPaymentMethodIdOption = useIOSelector(
    walletPaymentSelectedPaymentMethodIdOptionSelector
  );
  const selectedPaymentMethodOption = useIOSelector(
    walletPaymentSelectedPaymentMethodOptionSelector
  );
  const contextualOnboardingUrlPot = useIOSelector(
    walletPaymentContextualOnboardingUrlSelector
  );
  const currentStep = useIOSelector(selectWalletPaymentCurrentStep);
  const [waitingTransactionActivation, setWaitingTransactionActivation] =
    useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(
        paymentsGetPaymentMethodsAction.request({
          amount: pot.toUndefined(pot.map(paymentDetailsPot, el => el.amount))
        })
      );
    }, [dispatch, paymentDetailsPot])
  );

  useOnFirstRender(() => {
    AccessibilityInfo.announceForAccessibility(
      I18n.t("wallet.payment.methodSelection.a11y.pageStatus", {
        currentPage: WalletPaymentStepEnum.PICK_PAYMENT_METHOD,
        totalPages: PAYMENT_STEPS_TOTAL_PAGES
      })
    );
    dispatch(paymentsGetRecentPaymentMethodUsedAction.request());
  });

  useEffect(() => {
    if (currentStep === WalletPaymentStepEnum.PICK_PAYMENT_METHOD) {
      setAccessibilityFocus(titleRef, 200 as Millisecond);
    }
  }, [currentStep]);

  const handleOnboardingOutcome = ({
    outcome,
    walletId,
    orderId,
    transactionId
  }: WalletOnboardingOutcomeParams) => {
    dispatch(paymentClearWebViewFlow());
    if (outcome === WalletOnboardingOutcomeEnum.SUCCESS) {
      if (walletId && transactionId) {
        dispatch(
          paymentsGetPaymentTransactionInfoAction.request({
            transactionId,
            walletId
          })
        );
      } else {
        createTransaction(orderId);
      }
    } else if (outcome !== WalletOnboardingOutcomeEnum.CANCELED_BY_USER) {
      navigation.replace(
        PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_NAVIGATOR,
        {
          screen: PaymentsOnboardingRoutes.PAYMENT_ONBOARDING_RESULT_FEEDBACK,
          params: {
            outcome
          }
        }
      );
    }
  };

  const { startContextualOnboarding, isLoading: isOnboardingLoading } =
    useWalletOnboardingWebView({
      onOnboardingOutcome: handleOnboardingOutcome
    });

  const calculateFeesForSelectedPaymentMethod = useCallback(() => {
    pipe(
      sequenceT(O.Monad)(
        pot.toOption(paymentAmountPot),
        pot.toOption(transactionPot),
        selectedPaymentMethodIdOption
      ),
      O.map(([paymentAmount, transaction, paymentMethodId]) => {
        // We can safely get this data from the first payment object
        // This logic should be revisited once the cart feature will be implemented
        const primaryPayment = transaction.payments[0];

        const transferList = primaryPayment.transferList ?? [];
        const paymentToken = primaryPayment?.paymentToken;
        const primaryTransfer = primaryPayment?.transferList?.[0];
        const isAllCCP = primaryPayment?.isAllCCP;
        const primaryCreditorInstitution = primaryTransfer?.paFiscalCode;

        // In case of guest payment walletId could be undefined
        const walletId = O.toUndefined(selectedWalletIdOption);

        // In case of an onboarded wallet, it could be present the idPsp that needs to be preselected in the calculateFees request
        const idPsp = pipe(
          userWalletsPots,
          pot.toOption,
          O.chainNullableK(wallets =>
            wallets.find(wallet => wallet.walletId === walletId)
          ),
          O.chainNullableK(wallet => wallet.details as UIWalletInfoDetails),
          O.map(details => details.pspId),
          O.getOrElseW(() => undefined)
        );

        dispatch(
          paymentsCalculatePaymentFeesAction.request({
            paymentToken,
            paymentMethodId,
            walletId,
            orderId: contextualPaymentOrderId,
            paymentAmount,
            transferList,
            isAllCCP,
            primaryCreditorInstitution,
            idPsp
          })
        );
      })
    );
    setWaitingTransactionActivation(false);
  }, [
    dispatch,
    paymentAmountPot,
    transactionPot,
    userWalletsPots,
    selectedPaymentMethodIdOption,
    contextualPaymentOrderId,
    selectedWalletIdOption
  ]);

  const isLoading =
    pot.isLoading(paymentMethodsPot) || pot.isLoading(userWalletsPots);

  const isLoadingTransaction =
    pot.isLoading(transactionPot) ||
    waitingTransactionActivation ||
    pot.isLoading(pspListPot) ||
    pot.isLoading(contextualOnboardingUrlPot) ||
    isOnboardingLoading;

  const isError =
    pot.isError(transactionPot) ||
    pot.isError(paymentMethodsPot) ||
    pot.isError(userWalletsPots) ||
    pot.isError(pspListPot);

  const getFirstPotError = useCallback(() => {
    if (pot.isError(transactionPot)) {
      return transactionPot.error;
    }
    if (pot.isError(pspListPot)) {
      return pspListPot.error;
    }
    if (pot.isError(paymentMethodsPot)) {
      return paymentMethodsPot.error;
    }
    if (pot.isError(userWalletsPots)) {
      return userWalletsPots.error;
    }
    return {
      faultCodeCategory: FaultCodeCategoryEnum.GENERIC_ERROR,
      faultCodeDetail: "GENERIC_ERROR"
    };
  }, [transactionPot, pspListPot, paymentMethodsPot, userWalletsPots]);

  useOnFirstRender(
    () => {
      analytics.trackPaymentMethodSelection({
        attempt: paymentAnalyticsData?.attempt,
        organization_name: paymentAnalyticsData?.verifiedData?.paName,
        organization_fiscal_code:
          paymentAnalyticsData?.verifiedData?.paFiscalCode,
        service_name: paymentAnalyticsData?.serviceName,
        amount: paymentAnalyticsData?.formattedAmount,
        saved_payment_method:
          paymentAnalyticsData?.savedPaymentMethods?.length || 0,
        saved_payment_method_unavailable:
          paymentAnalyticsData?.savedPaymentMethodsUnavailable?.length,
        last_used_payment_method: "no", // <- TODO: This should be dynamic when the feature will be implemented
        expiration_date: paymentAnalyticsData?.verifiedData?.dueDate
      });
    },
    () => !isLoading && !!paymentAnalyticsData
  );

  useEffect(() => {
    if (isError) {
      const error = getFirstPotError();
      navigation.replace(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_FAILURE,
        params: {
          error
        }
      });
    }
  }, [isError, navigation, getFirstPotError]);

  const canContinue = O.isSome(selectedPaymentMethodIdOption);

  const getSelectedPaymentMethodFlag = () =>
    pipe(
      sequenceT(O.Monad)(selectedPaymentMethodIdOption, selectedWalletIdOption),
      O.fold(
        () => "none" as PaymentAnalyticsSelectedMethodFlag,
        () => "saved" as PaymentAnalyticsSelectedMethodFlag
      )
    );

  const handleOnCreateTransactionError = () => {
    setWaitingTransactionActivation(false);
  };

  const handleStartContextualOnboarding = (redirectUrl: string) => {
    startContextualOnboarding(redirectUrl);
  };

  const handleContinue = () => {
    analytics.trackPaymentMethodSelected({
      attempt: paymentAnalyticsData?.attempt,
      organization_name: paymentAnalyticsData?.verifiedData?.paName,
      organization_fiscal_code:
        paymentAnalyticsData?.verifiedData?.paFiscalCode,
      service_name: paymentAnalyticsData?.serviceName,
      amount: paymentAnalyticsData?.formattedAmount,
      expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
      payment_method_selected: paymentAnalyticsData?.selectedPaymentMethod,
      payment_method_selected_flag: getSelectedPaymentMethodFlag()
    });
    pipe(
      pot.toOption(paymentDetailsPot),
      O.map(paymentDetails => {
        const selectedPaymentMethod = O.toUndefined(
          selectedPaymentMethodOption
        );
        if (selectedPaymentMethod?.name === "CARDS") {
          dispatch(
            paymentsGetContextualOnboardingUrlAction.request({
              paymentMethodId: selectedPaymentMethod.id,
              rptId: paymentDetails.rptId,
              amount: paymentDetails.amount as AmountEuroCents,
              onSuccess: handleStartContextualOnboarding
            })
          );
          return;
        }
        if (isTransactionAlreadyActivated) {
          // If transacion is already activated (for example, when the user returns to this screen to edit the selected
          // method) we can go directly to the next step.
          calculateFeesForSelectedPaymentMethod();
          return;
        }
        createTransaction();
      })
    );
  };

  const createTransaction = (orderId?: string) => {
    const paymentDetails = pot.toUndefined(paymentDetailsPot);
    if (!paymentDetails) {
      IOToast.error(I18n.t("global.genericError"));
      return;
    }
    dispatch(
      paymentsCreateTransactionAction.request({
        orderId,
        data: {
          paymentNotices: [
            {
              rptId: paymentDetails.rptId,
              amount: paymentDetails.amount as AmountEuroCents
            }
          ]
        },
        onError: handleOnCreateTransactionError
      })
    );
    setWaitingTransactionActivation(true);
  };

  useEffect(() => {
    if (pot.isSome(transactionPot) && !pot.isLoading(transactionPot)) {
      calculateFeesForSelectedPaymentMethod();
    }
    // This effect is needed to calculate the fees for the selected payment method ..
    // .. and must be executed only when the transaction details are changing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionPot]);

  return (
    <IOScrollView
      actions={
        canContinue
          ? {
              type: "SingleButton",
              primary: {
                label: I18n.t("global.buttons.continue"),
                accessibilityLabel: I18n.t("global.buttons.continue"),
                onPress: handleContinue,
                disabled: isLoading || isLoadingTransaction,
                loading: isLoading || isLoadingTransaction
              }
            }
          : undefined
      }
    >
      <H2 accessibilityRole="header" ref={titleRef}>
        {I18n.t("wallet.payment.methodSelection.header")}
      </H2>
      <VSpacer size={16} />
      {isLoading ? (
        <CheckoutPaymentMethodsListSkeleton />
      ) : (
        <CheckoutPaymentMethodsList />
      )}
    </IOScrollView>
  );
};

export { WalletPaymentPickMethodScreen };
