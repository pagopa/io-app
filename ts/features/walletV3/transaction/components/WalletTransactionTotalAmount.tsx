import React from "react";
import { View } from "react-native";
import { H3, H6, IOStyles } from "@pagopa/io-app-design-system";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import I18n from "../../../../i18n";

type TotalAmountSectionProps = {
  totalAmount: number;
};

export const WalletTransactionTotalAmount = ({
  totalAmount
}: TotalAmountSectionProps) => {
  const formattedTotalAmount = formatNumberCentsToAmount(
    totalAmount,
    true,
    "right"
  );

  return (
    <View
      style={[IOStyles.rowSpaceBetween, IOStyles.alignCenter, IOStyles.flex]}
    >
      <H6 color="info-850">{I18n.t("transaction.details.totalAmount")}</H6>
      <H3>{formattedTotalAmount}</H3>
    </View>
  );
};
