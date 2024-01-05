import * as pot from "@pagopa/ts-commons/lib/pot";
import { useNavigation } from "@react-navigation/native";
import { Alert } from "react-native";
import I18n from "../../../../i18n";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { useIODispatch, useIOSelector } from "../../../../store/hooks";
import { walletPaymentDeleteTransaction } from "../store/actions/networking";
import { walletPaymentTransactionSelector } from "../store/selectors";
import { WalletPaymentRoutes } from "../navigation/routes";

const useWalletPaymentGoBackHandler = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();
  const transactionPot = useIOSelector(walletPaymentTransactionSelector);
  const dispatch = useIODispatch();

  // If we have a transaction in the store means that the user has already locked the debt position.
  // Before leaving the payment flow we must ask to the user if he is sure he wants to proceed and
  // then unlock the debt position by deleting the transaction
  if (pot.isSome(transactionPot)) {
    const { transactionId } = transactionPot.value;

    const handleConfirmAbort = () => {
      dispatch(walletPaymentDeleteTransaction.request(transactionId));
      navigation.push(WalletPaymentRoutes.WALLET_PAYMENT_MAIN, {
        screen: WalletPaymentRoutes.WALLET_PAYMENT_OUTCOME,
        params: {
          isCancelled: true
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
