import {
  Body,
  ButtonLink,
  ButtonSolid,
  H4,
  IOVisualCostants,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";
import { useIONavigation } from "../../../../navigation/params/AppParamsList";
import { PaymentsBarcodeRoutes } from "../../barcode/navigation/routes";
import { PaymentsTransactionRoutes } from "../../transaction/navigation/routes";

type Props = {
  withPictogram?: boolean;
};

const PaymentsHomeEmptyScreenContent = ({ withPictogram = false }: Props) => {
  const navigation = useIONavigation();

  const handleOnAddMethodPress = () => {
    navigation.navigate(PaymentsBarcodeRoutes.PAYMENT_BARCODE_NAVIGATOR, {
      screen: PaymentsBarcodeRoutes.PAYMENT_BARCODE_SCAN
    });
  };

  const handleOnFindLegacyTransactionsPress = () => {
    navigation.navigate(
      PaymentsTransactionRoutes.PAYMENT_TRANSACTION_NAVIGATOR,
      {
        screen: PaymentsTransactionRoutes.PAYMENT_TRANSACTION_LIST
      }
    );
  };

  return (
    <View
      testID="PaymentsHomeEmptyScreenContentTestID"
      style={styles.container}
    >
      {withPictogram && (
        <View testID="PaymentsHomeEmptyScreenContentTestID-pictogram">
          <Pictogram name="empty" />
          <VSpacer size={16} />
        </View>
      )}
      <H4 style={styles.centerText}>
        {I18n.t("features.payments.transactions.empty.title")}
      </H4>
      <VSpacer size={8} />
      <Body style={styles.centerText}>
        {I18n.t("features.payments.transactions.empty.content")}
      </Body>
      <VSpacer size={24} />
      <View style={{ alignItems: "center" }}>
        <ButtonSolid
          label={I18n.t("features.payments.cta")}
          accessibilityLabel={I18n.t("features.payments.cta")}
          onPress={handleOnAddMethodPress}
          fullWidth={true}
          icon="qrCode"
          iconPosition="end"
        />
        <VSpacer size={16} />
        <ButtonLink
          label="Cerca ricevute meno recenti"
          onPress={handleOnFindLegacyTransactionsPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    paddingHorizontal: IOVisualCostants.appMarginDefault,
    alignItems: "center",
    justifyContent: "center"
  },
  centerText: { textAlign: "center" }
});

export { PaymentsHomeEmptyScreenContent };
