import { useNavigation } from "@react-navigation/native";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import { WalletOnboardingRoutes } from "../../onboarding/navigation/navigator";
import I18n from "../../../../i18n";

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
      title={I18n.t("wallet.payment.methodSelection.missingMethodsError.title")}
      subtitle={I18n.t(
        "wallet.payment.methodSelection.missingMethodsError.subtitle"
      )}
      action={{
        label: I18n.t(
          "wallet.payment.methodSelection.missingMethodsError.addMethod"
        ),
        accessibilityLabel: I18n.t(
          "wallet.payment.methodSelection.missingMethodsError.addMethod"
        ),
        onPress: handleAddMethod
      }}
      secondaryAction={{
        label: I18n.t(
          "wallet.payment.methodSelection.missingMethodsError.notNow"
        ),
        accessibilityLabel: I18n.t(
          "wallet.payment.methodSelection.missingMethodsError.notNow"
        ),
        onPress: handleNotNow
      }}
    />
  );
};

export { WalletPaymentMissingMethodsError };
