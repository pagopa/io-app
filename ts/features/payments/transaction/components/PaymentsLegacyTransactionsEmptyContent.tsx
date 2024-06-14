import {
  Body,
  H4,
  IOVisualCostants,
  Pictogram,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../../i18n";

type Props = {
  withPictogram?: boolean;
};

const PaymentsLegacyTransactionsEmptyContent = ({
  withPictogram = false
}: Props) => (
  <View
    testID="PaymentsLegacyTransactionsEmptyContentTestID"
    style={styles.container}
  >
    {withPictogram && (
      <View testID="PaymentsLegacyTransactionsEmptyContentTestID-pictogram">
        <Pictogram name="emptyArchive" />
        <VSpacer size={16} />
      </View>
    )}
    <H4 style={styles.centerText}>
      {I18n.t("features.payments.transactions.legacy.empty.title")}
    </H4>
    <VSpacer size={8} />
    <Body style={styles.centerText}>
      {I18n.t("features.payments.transactions.legacy.empty.body")}
    </Body>
    <VSpacer size={24} />
  </View>
);

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

export { PaymentsLegacyTransactionsEmptyContent };
