import React from "react";
import { View } from "react-native";
import { Body, H1, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { Psp, Transaction } from "../../../../types/pagopa";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import I18n from "../../../../i18n";

import { WalletTransactionTotalAmount } from "./WalletTransactionTotalAmount";

type Props = {
  transaction: Transaction;
  psp?: Psp;
};

export const WalletTransactionHeadingSection = ({
  transaction,
  psp
}: Props) => {
  const FeeAmountSection = () => {
    if (psp && transaction.fee) {
      const formattedFee = formatNumberCentsToAmount(
        transaction.fee.amount,
        true,
        "right"
      );
      return (
        <Body>
          {I18n.t("transaction.details.totalFee")}{" "}
          <Body weight="Medium">{formattedFee}</Body>{" "}
          {I18n.t("transaction.details.totalFeePsp", {
            pspName: psp.businessName || ""
          })}
          .
        </Body>
      );
    }
    return <></>;
  };
  return (
    <View
      style={[
        IOStyles.horizontalContentPadding,
        IOStyles.flex,
        IOStyles.bgWhite
      ]}
    >
      <H1>{I18n.t("transaction.details.title")}</H1>
      <VSpacer size={16} />
      {/* <DetailsList /> */}
      <WalletTransactionTotalAmount totalAmount={transaction.amount.amount} />
      <VSpacer size={8} />
      <FeeAmountSection />
      <VSpacer size={8} />
    </View>
  );
};
