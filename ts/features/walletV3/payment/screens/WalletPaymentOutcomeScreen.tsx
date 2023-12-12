import { useNavigation } from "@react-navigation/native";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";

const WalletPaymentOutcomeScreen = () => {
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

export { WalletPaymentOutcomeScreen };
