import { GradientScrollView, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { PaymentsBarcodeRoutes } from "../../barcode/navigation/routes";
import { PaymentsHomeTransactionList } from "../components/PaymentsHomeTransactionList";
import { PaymentsHomeUserMethodsList } from "../components/PaymentsHomeUserMethodsList";

export const PaymentsHomeScreen = () => {
  const navigation = useIONavigation();

  const handleOnPayNoticedPress = () => {
    navigation.navigate(PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR, {
      screen: PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN
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
      <PaymentsHomeUserMethodsList />
      <VSpacer size={24} />
      <PaymentsHomeTransactionList />
    </GradientScrollView>
  );
};
