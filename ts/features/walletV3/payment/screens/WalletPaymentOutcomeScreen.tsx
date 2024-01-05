import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { WalletPaymentParamsList } from "../navigation/params";
import I18n from "../../../../i18n";

type WalletPaymentOutcomeScreenNavigationParams = {
  isCancelled?: boolean;
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

  if (params.isCancelled) {
    return (
      <OperationResultScreenContent
        pictogram="trash"
        title={I18n.t("wallet.payment.outcome.cancelled.title")}
        subtitle={I18n.t("wallet.payment.outcome.cancelled.subtitle")}
        action={{
          label: I18n.t("global.buttons.close"),
          accessibilityLabel: I18n.t("global.buttons.close"),
          onPress: () => navigation.pop(2)
        }}
      />
    );
  }

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
