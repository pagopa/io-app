import { GradientScrollView, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { PaymentsCheckoutRoutes } from "../../checkout/navigation/routes";
import { PaymentsTransactionsList } from "../components/PaymentsTransactionsList";
import { PaymentsUserMethodsList } from "../components/PaymentsUserMethodsList";

export const PaymentsHomeScreen = () => {
  const navigation = useIONavigation();

  const handleOnPayNoticedPress = () => {
    navigation.navigate(PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_NAVIGATOR, {
      screen: PaymentsCheckoutRoutes.PAYMENT_CHECKOUT_INPUT_NOTICE_NUMBER
    });
  };

  return (
    <GradientScrollView
      primaryActionProps={{
        accessibilityLabel: I18n.t("payment.homeScreen.CTA"),
        label: I18n.t("payment.homeScreen.CTA"),
        onPress: handleOnPayNoticedPress,
        icon: "qrCode",
        iconPosition: "end"
      }}
      excludeSafeAreaMargins={true}
    >
      <PaymentsUserMethodsList />
      <VSpacer size={24} />
      <PaymentsTransactionsList />
    </GradientScrollView>
  );
};
