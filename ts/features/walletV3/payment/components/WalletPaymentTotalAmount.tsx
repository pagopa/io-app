import React from "react";
import Placeholder from "rn-placeholder";
import { StyleSheet, View } from "react-native";
import { Divider, H3, H6, IOStyles } from "@pagopa/io-app-design-system";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import I18n from "../../../../i18n";

type TotalAmountSectionProps = {
  totalAmount?: number;
  loading?: boolean;
};

const styles = StyleSheet.create({
  container: {
    ...IOStyles.rowSpaceBetween,
    ...IOStyles.alignCenter,
    ...IOStyles.flex,
    paddingVertical: 16
  }
});

export const WalletPaymentTotalAmount = ({
  totalAmount,
  loading
}: TotalAmountSectionProps) => (
  <>
    <View style={styles.container}>
      <H6 color="grey-700">{I18n.t("payment.confirm.totalAmount")}</H6>
      {loading && (
        <View>
          <Placeholder.Box width={72} height={34} animate="fade" radius={8} />
        </View>
      )}
      {!loading && totalAmount && (
        <H3>{formatNumberCentsToAmount(totalAmount, true, "right")}</H3>
      )}
    </View>
    <Divider />
  </>
);
