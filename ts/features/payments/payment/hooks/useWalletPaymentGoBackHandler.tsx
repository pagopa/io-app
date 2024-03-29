import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { paymentsDeleteTransactionAction } from "../store/actions/networking";
import { walletPaymentTransactionSelector } from "../store/selectors";
import { PaymentsPaymentRoutes } from "../navigation/routes";
import { WalletPaymentOutcomeEnum } from "../types/PaymentOutcomeEnum";

const useWalletPaymentGoBackHandler = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const dispatch = useIODispatch();

  if (pot.isLoading(transactionPot)) {
    // If transaction is pending cancellation we block every interaction with the back button
    return () => undefined;
  }

  // If we have a transaction in the store means that the user has already locked the debt position.
  // Before leaving the payment flow we must ask to the user if he is sure he wants to proceed and
  // then unlock the debt position by deleting the transaction
  if (pot.isSome(transactionPot)) {
    const { transactionId } = transactionPot.value;

    const handleConfirmAbort = () => {
      dispatch(paymentsDeleteTransactionAction.request(transactionId));
      navigation.push(PaymentsPaymentRoutes.PAYMENTS_PAYMENT_NAVIGATOR, {
        screen: PaymentsPaymentRoutes.PAYMENTS_PAYMENT_OUTCOME,
        params: {
          outcome: WalletPaymentOutcomeEnum.CANCELED_BY_USER
        }
      });
    };

    return () => {
      Alert.alert(I18n.t("wallet.payment.abortDialog.title"), undefined, [
        {
          text: I18n.t("wallet.payment.abortDialog.confirm"),
          style: "destructive",
          onPress: handleConfirmAbort
        },
        {
          text: I18n.t("wallet.payment.abortDialog.cancel"),
          style: "cancel"
        }
      ]);
    };
  }

  // If there is no transaction stored then we can return undefined (no handler)
  return undefined;
};

export { useWalletPaymentGoBackHandler };
