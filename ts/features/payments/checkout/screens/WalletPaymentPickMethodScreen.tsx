import {
  GradientScrollView,
  H2,
  VSpacer,
  useIOToast
} from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import { sequenceT } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React, { useEffect } from "react";
import _ from "lodash";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import {
  CheckoutPaymentMethodsList,
  CheckoutPaymentMethodsListSkeleton
} from "../components/CheckoutPaymentMethodsList";
import { useOnTransactionActivationEffect } from "../hooks/useOnTransactionActivationEffect";
import { PaymentsCheckoutRoutes } from "../navigation/routes";
import {
  paymentsCalculatePaymentFeesAction,
  paymentsCreateTransactionAction,
  paymentsGetPaymentMethodsAction,
  paymentsGetPaymentUserMethodsAction
} from "../store/actions/networking";
import {
  walletPaymentAmountSelector,
  walletPaymentDetailsSelector
} from "../store/selectors";
import {
  notHasValidPaymentMethodsSelector,
  walletPaymentAllMethodsSelector,
  walletPaymentEnabledUserWalletsSelector,
  walletPaymentSelectedPaymentMethodIdOptionSelector,
  walletPaymentSelectedWalletIdOptionSelector
} from "../store/selectors/paymentMethods";
import { walletPaymentPspListSelector } from "../store/selectors/psps";
import {
  walletPaymentIsTransactionActivatedSelector,
  walletPaymentTransactionSelector
} from "../store/selectors/transaction";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";
import { paymentsInitOnboardingWithRptIdToResume } from "../../onboarding/store/actions";
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import * as analytics from "../analytics";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { selectOngoingPaymentHistorySelector } from "../../history/store/selectors";
import { PaymentAnalyticsSelectedMethodFlag } from "../types/PaymentAnalyticsSelectedMethodFlag";

const WalletPaymentPickMethodScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();
  const toast = useIOToast();

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const paymentAmountPot = useIOSelector(walletPaymentAmountSelector);
  const paymentMethodsPot = useIOSelector(walletPaymentAllMethodsSelector);
  const userWalletsPots = useIOSelector(
    walletPaymentEnabledUserWalletsSelector
  );
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const isTransactionAlreadyActivated = useIOSelector(
    walletPaymentIsTransactionActivatedSelector
  );
  const pspListPot = useIOSelector(walletPaymentPspListSelector);
  const notHasValidPaymentMethods = useIOSelector(
    notHasValidPaymentMethodsSelector
  );

  const paymentOngoingHistory = useIOSelector(
    selectOngoingPaymentHistorySelector
  );

  const selectedWalletIdOption = useIOSelector(
    walletPaymentSelectedWalletIdOptionSelector
  );
  const selectedPaymentMethodIdOption = useIOSelector(
    walletPaymentSelectedPaymentMethodIdOptionSelector
  );
  const [waitingTransactionActivation, setWaitingTransactionActivation] =
    React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(paymentsGetPaymentMethodsAction.request());
      dispatch(paymentsGetPaymentUserMethodsAction.request());
    }, [dispatch])
  );

  // If the user doesn't have any onboarded payment method and the backend doesn't return any payment method as guest ..
  // .. we redirect the user to the outcome screen with an outcome that allow the user to start the onboarding process of a new payment method.
  // .. This implementation will be removed as soon as the backend will migrate totally to the NPG. (https://pagopa.atlassian.net/browse/IOBP-632)
  useEffect(() => {
    if (notHasValidPaymentMethods) {
      const paymentDetails = pot.toUndefined(paymentDetailsPot);
      dispatch(
        paymentsInitOnboardingWithRptIdToResume({
          rptId: paymentDetails?.rptId
        })
      );
      navigation.replace(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_OUTCOME,
        params: {
          outcome: WalletPaymentOutcomeEnum.PAYMENT_METHODS_NOT_AVAILABLE
        }
      });
    }
  }, [notHasValidPaymentMethods, paymentDetailsPot, navigation, dispatch]);

  const handleOnTransactionCreationError = () => {
    toast.error(I18n.t("features.payments.errors.transactionCreationError"));
    analytics.trackPaymentMethodVerificaFatalError({
      organization_name: paymentOngoingHistory?.verifiedData?.paName,
      service_name: paymentOngoingHistory?.serviceName,
      attempt: paymentOngoingHistory?.attempt,
      expiration_date: paymentOngoingHistory?.verifiedData?.dueDate
    });
  };

  const calculateFeesForSelectedPaymentMethod = React.useCallback(() => {
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
    selectedWalletIdOption
  ]);

  // When a new transaction is created it comes with ACTIVATION_REQUESTED status, we can continue the payment flow
  // only when the transaction status becomes ACTIVATED.
  useOnTransactionActivationEffect(calculateFeesForSelectedPaymentMethod);

  const isLoading =
    pot.isLoading(paymentMethodsPot) || pot.isLoading(userWalletsPots);

  const isLoadingTransaction =
    pot.isLoading(transactionPot) ||
    waitingTransactionActivation ||
    pot.isLoading(pspListPot);

  const isError =
    pot.isError(transactionPot) ||
    pot.isError(paymentMethodsPot) ||
    pot.isError(userWalletsPots) ||
    pot.isError(pspListPot);

  useOnFirstRender(
    () => {
      analytics.trackPaymentMethodSelection({
        attempt: paymentOngoingHistory?.attempt,
        organization_name: paymentOngoingHistory?.verifiedData?.paName,
        service_name: paymentOngoingHistory?.serviceName,
        amount: paymentOngoingHistory?.formattedAmount,
        saved_payment_method:
          paymentOngoingHistory?.savedPaymentMethods?.length,
        saved_payment_method_unavailable:
          paymentOngoingHistory?.savedPaymentMethodsUnavailable?.length,
        last_used_payment_method: "no", // <- TODO: This should be dynamic when the feature will be implemented
        expiration_date: paymentOngoingHistory?.verifiedData?.dueDate
      });
    },
    () => !isLoading && !!paymentOngoingHistory
  );

  React.useEffect(() => {
    if (isError) {
      navigation.replace(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_OUTCOME,
        params: {
          outcome: WalletPaymentOutcomeEnum.GENERIC_ERROR
        }
      });
    }
  }, [isError, navigation]);

  const canContinue = O.isSome(selectedPaymentMethodIdOption);

  const getSelectedPaymentMethodFlag = () =>
    pipe(
      sequenceT(O.Monad)(selectedPaymentMethodIdOption, selectedWalletIdOption),
      O.fold(
        () => "none" as PaymentAnalyticsSelectedMethodFlag,
        () => "saved" as PaymentAnalyticsSelectedMethodFlag
      )
    );

  const handleContinue = () => {
    analytics.trackPaymentMethodSelected({
      attempt: paymentOngoingHistory?.attempt,
      organization_name: paymentOngoingHistory?.verifiedData?.paName,
      service_name: paymentOngoingHistory?.serviceName,
      amount: paymentOngoingHistory?.formattedAmount,
      expiration_date: paymentOngoingHistory?.verifiedData?.dueDate,
      payment_method_selected: paymentOngoingHistory?.selectedPaymentMethod,
      payment_method_selected_flag: getSelectedPaymentMethodFlag()
    });
    if (isTransactionAlreadyActivated) {
      // If transacion is already activated (for example, when the user returns to this screen to edit the selected
      // method) we can go directly to the next step.
      calculateFeesForSelectedPaymentMethod();
    } else {
      pipe(
        pot.toOption(paymentDetailsPot),
        O.map(paymentDetails => {
          dispatch(
            paymentsCreateTransactionAction.request({
              paymentNotices: [
                { rptId: paymentDetails.rptId, amount: paymentDetails.amount }
              ],
              onError: handleOnTransactionCreationError
            })
          );
          setWaitingTransactionActivation(true);
        })
      );
    }
  };

  return (
    <GradientScrollView
      primaryActionProps={
        canContinue
          ? {
              label: I18n.t("global.buttons.continue"),
              accessibilityLabel: I18n.t("global.buttons.continue"),
              onPress: handleContinue,
              disabled: isLoading || isLoadingTransaction,
              loading: isLoading || isLoadingTransaction
            }
          : undefined
      }
    >
      <H2>{I18n.t("wallet.payment.methodSelection.header")}</H2>
      <VSpacer size={16} />
      {isLoading ? (
        <CheckoutPaymentMethodsListSkeleton />
      ) : (
        <CheckoutPaymentMethodsList />
      )}
    </GradientScrollView>
  );
};

export { WalletPaymentPickMethodScreen };
