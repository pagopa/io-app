import React from "react";
import Placeholder from "rn-placeholder";
import { View } from "react-native";
import { H3, H6, IOStyles } from "@pagopa/io-app-design-system";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import I18n from "../../../../i18n";

type TotalAmountSectionProps = {
  totalAmount?: number;
  loading?: boolean;
};

export const WalletTransactionTotalAmount = ({
  totalAmount,
  loading
}: TotalAmountSectionProps) => (
  <View style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter, IOStyles.flex]}>
    <H6 color="info-850">{I18n.t("transaction.details.totalAmount")}</H6>
    {loading && (
      <View>
        <Placeholder.Box width={72} height={34} animate="fade" radius={8} />
      </View>
    )}
    {!loading && totalAmount && (
      <H3>{formatNumberCentsToAmount(totalAmount, true, "right")}</H3>
    )}
  </View>
);
