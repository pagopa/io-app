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
  isPaymentsSectionEmptySelector,
  isPaymentsSectionLoadingSelector,
  isPaymentsTransactionsEmptySelector
} from "../store/selectors";

const PaymentsHomeScreen = () => {
  const navigation = useIONavigation();

  const isLoading = useIOSelector(isPaymentsSectionLoadingSelector);
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
        <PaymentsHomeScreenContent />
      </ScrollView>
    );
  }

  return (
    <GradientScrollView
      primaryActionProps={
        isLoading
          ? undefined
          : {
              accessibilityLabel: I18n.t("features.payments.cta"),
              label: I18n.t("features.payments.cta"),
              onPress: handleOnPayNoticedPress,
              icon: "qrCode",
              iconPosition: "end",
              testID: "PaymentsHomeScreenTestID-cta"
            }
      }
      excludeSafeAreaMargins={true}
    >
      <PaymentsHomeScreenContent />
    </GradientScrollView>
  );
};

const PaymentsHomeScreenContent = () => {
  const isLoading = useIOSelector(isPaymentsSectionLoadingSelector);
  const isEmpty = useIOSelector(isPaymentsSectionEmptySelector);

  if (isEmpty) {
    return <PaymentsHomeEmptyScreenContent withPictogram={true} />;
  }

  return (
    <>
      <PaymentsHomeUserMethodsList enforcedLoadingState={isLoading} />
      <PaymentsHomeTransactionsList enforcedLoadingState={isLoading} />
    </>
  );
};

export { PaymentsHomeScreen };
