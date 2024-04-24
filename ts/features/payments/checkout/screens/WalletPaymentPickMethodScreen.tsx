import { GradientScrollView, H2, VSpacer } from "@pagopa/io-app-design-system";
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
  walletPaymentAllMethodsSelector,
  walletPaymentSelectedPaymentMethodIdOptionSelector,
  walletPaymentSelectedWalletIdOptionSelector,
  walletPaymentUserWalletsSelector
} from "../store/selectors/paymentMethods";
import { walletPaymentPspListSelector } from "../store/selectors/psps";
import {
  walletPaymentIsTransactionActivatedSelector,
  walletPaymentTransactionSelector
} from "../store/selectors/transaction";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";
import { Wallets } from "../../../../../definitions/pagopa/ecommerce/Wallets";
import { PaymentMethodsResponse } from "../../../../../definitions/pagopa/ecommerce/PaymentMethodsResponse";
import { PaymentsOnboardingRoutes } from "../../onboarding/navigation/routes";
import { paymentsInitOnboardingWithRptIdToResume } from "../../onboarding/store/actions";

const WalletPaymentPickMethodScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const paymentAmountPot = useIOSelector(walletPaymentAmountSelector);
  const paymentMethodsPot = useIOSelector(walletPaymentAllMethodsSelector);
  const userWalletsPots = useIOSelector(walletPaymentUserWalletsSelector);
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const isTransactionAlreadyActivated = useIOSelector(
    walletPaymentIsTransactionActivatedSelector
  );
  const pspListPot = useIOSelector(walletPaymentPspListSelector);

  const selectedWalletIdOption = useIOSelector(
    walletPaymentSelectedWalletIdOptionSelector
  );
  const selectedPaymentMethodIdOption = useIOSelector(
    walletPaymentSelectedPaymentMethodIdOptionSelector
  );
  const [waitingTransactionActivation, setWaitingTransactionActivation] =
    React.useState(false);

  const userPaymentMethods = React.useMemo(
    () =>
      pipe(
        userWalletsPots,
        pot.toOption,
        O.getOrElse(() => [] as Wallets["wallets"])
      ),
    [userWalletsPots]
  );

  const allPaymentMethods = React.useMemo(
    () =>
      pipe(
        paymentMethodsPot,
        pot.toOption,
        O.getOrElse(() => [] as PaymentMethodsResponse["paymentMethods"])
      ),
    [paymentMethodsPot]
  );

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
    if (
      pot.isSome(paymentMethodsPot) &&
      _.isEmpty(allPaymentMethods) &&
      pot.isSome(userWalletsPots) &&
      _.isEmpty(userPaymentMethods) &&
      pot.isSome(paymentDetailsPot)
    ) {
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
  }, [
    userWalletsPots,
    allPaymentMethods,
    userPaymentMethods,
    paymentMethodsPot,
    paymentDetailsPot,
    navigation,
    dispatch
  ]);

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

        dispatch(
          paymentsCalculatePaymentFeesAction.request({
            paymentToken,
            paymentMethodId,
            walletId,
            paymentAmount,
            transferList,
            isAllCCP,
            primaryCreditorInstitution
          })
        );
      })
    );
    setWaitingTransactionActivation(false);
  }, [
    dispatch,
    paymentAmountPot,
    transactionPot,
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

  const handleContinue = () => {
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
              ]
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
