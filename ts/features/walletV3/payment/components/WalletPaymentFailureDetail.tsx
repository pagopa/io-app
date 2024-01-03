import { useNavigation } from "@react-navigation/native";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { WalletPaymentFailure } from "../types/failure";

type Props = {
  failure: WalletPaymentFailure;
};

const WalletPaymentFailureDetail = (props: Props) => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  const handleContinue = () => {
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

export { WalletPaymentFailureDetail };
