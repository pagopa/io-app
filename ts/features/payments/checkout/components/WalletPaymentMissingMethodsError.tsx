import { useNavigation } from "@react-navigation/native";
import React from "react";
import { OperationResultScreenContent } from "../../../../components/screens/OperationResultScreenContent";
import {
  AppParamsList,
  IOStackNavigationProp
} from "../../../../navigation/params/AppParamsList";
import I18n from "../../../../i18n";
import { PaymentsOnboardingRoutes } from "../../onboarding/navigation/routes";

const WalletPaymentMissingMethodsError = () => {
  const navigation = useNavigation<IOStackNavigationProp<AppParamsList>>();

  React.useEffect(() => {
    navigation.setOptions({
      header: () => undefined,
      headerTransparent: true
    });
  }, [navigation]);

  const handleAddMethod = () => {
    navigation.push(PaymentsOnboardingRoutes.PAYMENTS_ONBOARDING_NAVIGATOR, {
      screen: PaymentsOnboardingRoutes.PAYMENTS_ONBOARDING_SELECT_METHOD
    });
  };

  const handleNotNow = () => {
    navigation.pop();
  };

  return (
    <OperationResultScreenContent
      pictogram="cardAdd"
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
