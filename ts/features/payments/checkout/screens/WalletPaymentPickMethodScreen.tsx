import { GradientScrollView, H2, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import { sequenceT } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
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
  paymentsGetPaymentMethodsAction
} from "../store/actions/networking";
import {
  walletPaymentAmountSelector,
  walletPaymentDetailsSelector
} from "../store/selectors";
import {
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
import { UIWalletInfoDetails } from "../../common/types/UIWalletInfoDetails";
import * as analytics from "../analytics";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { paymentAnalyticsDataSelector } from "../../history/store/selectors";
import { PaymentAnalyticsSelectedMethodFlag } from "../types/PaymentAnalytics";

const WalletPaymentPickMethodScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

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
  const paymentAnalyticsData = useIOSelector(paymentAnalyticsDataSelector);

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
    }, [dispatch])
  );

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
        attempt: paymentAnalyticsData?.attempt,
        organization_name: paymentAnalyticsData?.verifiedData?.paName,
        service_name: paymentAnalyticsData?.serviceName,
        amount: paymentAnalyticsData?.formattedAmount,
        saved_payment_method: paymentAnalyticsData?.savedPaymentMethods?.length,
        saved_payment_method_unavailable:
          paymentAnalyticsData?.savedPaymentMethodsUnavailable?.length,
        last_used_payment_method: "no", // <- TODO: This should be dynamic when the feature will be implemented
        expiration_date: paymentAnalyticsData?.verifiedData?.dueDate
      });
    },
    () => !isLoading && !!paymentAnalyticsData
  );

  React.useEffect(() => {
    if (isError && !pot.isError(transactionPot)) {
      navigation.replace(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_OUTCOME,
        params: {
          outcome: WalletPaymentOutcomeEnum.GENERIC_ERROR
        }
      });
    } else if (isError && pot.isError(transactionPot)) {
      navigation.replace(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
        screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_FAILURE,
        params: {
          error: transactionPot.error
        }
      });
    }
  }, [isError, navigation, transactionPot]);

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

  const handleContinue = () => {
    analytics.trackPaymentMethodSelected({
      attempt: paymentAnalyticsData?.attempt,
      organization_name: paymentAnalyticsData?.verifiedData?.paName,
      service_name: paymentAnalyticsData?.serviceName,
      amount: paymentAnalyticsData?.formattedAmount,
      expiration_date: paymentAnalyticsData?.verifiedData?.dueDate,
      payment_method_selected: paymentAnalyticsData?.selectedPaymentMethod,
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
              data: {
                paymentNotices: [
                  { rptId: paymentDetails.rptId, amount: paymentDetails.amount }
                ]
              },
              onError: handleOnCreateTransactionError
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
