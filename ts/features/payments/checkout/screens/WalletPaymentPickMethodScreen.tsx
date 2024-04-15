import { GradientScrollView, H2, VSpacer } from "@pagopa/io-app-design-system";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { useFocusEffect } from "@react-navigation/native";
import { sequenceT } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import React from "react";
import { Transfer } from "../../../../../definitions/pagopa/ecommerce/Transfer";
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
  paymentsGetPaymentUserMethodsAction,
  paymentsResetPaymentPspList
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
import { walletPaymentTransactionSelector } from "../store/selectors/transaction";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";

const WalletPaymentPickMethodScreen = () => {
  const dispatch = useIODispatch();
  const navigation = useIONavigation();

  const paymentDetailsPot = useIOSelector(walletPaymentDetailsSelector);
  const paymentAmountPot = useIOSelector(walletPaymentAmountSelector);
  const paymentMethodsPot = useIOSelector(walletPaymentAllMethodsSelector);
  const userWalletsPots = useIOSelector(walletPaymentUserWalletsSelector);
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const pspListPot = useIOSelector(walletPaymentPspListSelector);

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
      dispatch(paymentsResetPaymentPspList());
    }, [dispatch])
  );

  // When a new transaction is created it comes with ACTIVATION_REQUESTED status, we can continue the payment flow
  // only when the transaction status becomes ACTIVATED.
  useOnTransactionActivationEffect(
    React.useCallback(() => {
      pipe(
        sequenceT(O.Monad)(
          pot.toOption(paymentAmountPot),
          pot.toOption(transactionPot),
          selectedPaymentMethodIdOption
        ),
        O.map(([paymentAmount, transaction, paymentMethodId]) => {
          const transferList = transaction.payments.reduce(
            (a, p) => [...a, ...(p.transferList ?? [])],
            [] as ReadonlyArray<Transfer>
          );
          const paymentToken = transaction.payments[0]?.paymentToken;

          // In case of guest payment walletId could be undefined
          const walletId = O.toUndefined(selectedWalletIdOption);

          dispatch(
            paymentsCalculatePaymentFeesAction.request({
              paymentToken,
              paymentMethodId,
              walletId,
              paymentAmount,
              transferList
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
    ])
  );

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
