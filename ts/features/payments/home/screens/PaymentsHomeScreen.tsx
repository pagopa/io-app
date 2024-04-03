import { GradientScrollView } from "@pagopa/io-app-design-system";
import * as React from "react";
import { ScrollView } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { useIOSelector } from "../../../../store/hooks";
import { PaymentsBarcodeRoutes } from "../../barcode/navigation/routes";
import { PaymentsHomeEmptyScreenContent } from "../components/PaymentsHomeEmptyScreenContent";
import { PaymentsHomeTransactionsList } from "../components/PaymentsHomeTransactionsList";
import { PaymentsHomeUserMethodsList } from "../components/PaymentsHomeUserMethodsList";
import {
  isPaymentsMethodsEmptySelector,
  isPaymentsSectionLoadingSelector,
  isPaymentsTransactionsEmptySelector
} from "../store/selectors";

export const PaymentsHomeScreen = () => {
  const navigation = useIONavigation();

  const isLoading = useIOSelector(isPaymentsSectionLoadingSelector);

  const isPaymentsEmpty = useIOSelector(isPaymentsMethodsEmptySelector);
  const isTransactionsEmpty = useIOSelector(
    isPaymentsTransactionsEmptySelector
  );

  const handleOnPayNoticedPress = () => {
    navigation.navigate(PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR, {
      screen: PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN
    });
  };

  if (isTransactionsEmpty) {
    return (
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          flexGrow: 1
        }}
      >
        {!isPaymentsEmpty && (
          <PaymentsHomeUserMethodsList enforcedLoadingState={isLoading} />
        )}
        <PaymentsHomeEmptyScreenContent withPictogram={isPaymentsEmpty} />
      </ScrollView>
    );
  }

  return (
    <GradientScrollView
      primaryActionProps={{
        accessibilityLabel: I18n.t("features.payments.cta"),
        label: I18n.t("features.payments.cta"),
        onPress: handleOnPayNoticedPress,
        icon: "qrCode",
        iconPosition: "end"
      }}
      excludeSafeAreaMargins={true}
    >
      <PaymentsHomeUserMethodsList enforcedLoadingState={isLoading} />
      <PaymentsHomeTransactionsList enforcedLoadingState={isLoading} />
    </GradientScrollView>
  );
};
