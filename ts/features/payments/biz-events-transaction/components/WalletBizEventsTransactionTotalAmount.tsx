import React from "react";
import Placeholder from "rn-placeholder";
import { StyleSheet, View } from "react-native";
import { H3, H6, IOStyles } from "@pagopa/io-app-design-system";
import I18n from "../../../../i18n";
import { formatAmountText } from "../utils";

type TotalAmountSectionProps = {
  totalAmount?: string;
  loading?: boolean;
};

const styles = StyleSheet.create({
  container: {
    ...IOStyles.rowSpaceBetween,
    ...IOStyles.alignCenter,
    ...IOStyles.flex
  }
});

export const WalletBizEventsTransactionTotalAmount = ({
  totalAmount,
  loading
}: TotalAmountSectionProps) => (
  <View style={styles.container}>
    <H6 color="grey-700">{I18n.t("transaction.details.totalAmount")}</H6>
    {loading && (
      <View>
        <Placeholder.Box width={72} height={34} animate="fade" radius={8} />
      </View>
    )}
    {!loading && totalAmount && <H3>{formatAmountText(totalAmount)}</H3>}
  </View>
);
