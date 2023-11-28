import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { WalletPaymentParamsList } from "../navigation/params";
import { WalletPaymentOutcome } from "../types/PaymentOutcomeEnum";

type WalletPaymentOutcomeScreenNavigationParams = {
  outcome: WalletPaymentOutcome;
};

type WalletPaymentOutcomeRouteProps = RouteProp<
  WalletPaymentParamsList,
  "WALLET_PAYMENT_OUTCOME"
>;

const WalletPaymentOutcomeScreen = () => {
  const { params } = useRoute<WalletPaymentOutcomeRouteProps>();
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const handleContinue = () => {
    navigation.popToTop();
    navigation.pop();
  };

  return (
    <OperationResultScreenContent
      title="Hai pagato xx,xx €"
      action={{
        label: "Ok chiudi",
        accessibilityLabel: "Ok, chiudi",
        onPress: handleContinue
      }}
    />
  );
};

export type { WalletPaymentOutcomeScreenNavigationParams };
export { WalletPaymentOutcomeScreen };
