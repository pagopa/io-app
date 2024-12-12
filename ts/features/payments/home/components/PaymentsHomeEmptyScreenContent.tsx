import {
  Body,
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
