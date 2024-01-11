import { useNavigation } from "@react-navigation/native";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { WalletOnboardingRoutes } from "../../onboarding/navigation/navigator";

const WalletPaymentMissingMethodsError = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  React.useEffect(() => {
    navigation.setOptions({
      header: () => undefined,
      headerTransparent: true
    });
  }, [navigation]);

  const handleAddMethod = () => {
    navigation.push(WalletOnboardingRoutes.WALLET_ONBOARDING_MAIN, {
      screen: WalletOnboardingRoutes.WALLET_ONBOARDING_SELECT_PAYMENT_METHOD
    });
  };

  const handleNotNow = () => {
    navigation.pop();
  };

  return (
    <OperationResultScreenContent
      title="Aggiungi un metodo per effettuare pagamenti in app"
      subtitle="Il metodo verrà salvato nel Portafoglio, così la prossima volta potrai pagare più facilmente."
      action={{
        label: "Aggiungi metodo",
        accessibilityLabel: "Aggiungi metodo",
        onPress: handleAddMethod
      }}
      secondaryAction={{
        label: "Non ora",
        accessibilityLabel: "Non ora",
        onPress: handleNotNow
      }}
    />
  );
};

export { WalletPaymentMissingMethodsError };
