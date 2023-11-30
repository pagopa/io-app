import { useNavigation } from "@react-navigation/native";
import Placeholder from "rn-placeholder";
import React from "react";
import { View } from "react-native";
import { Body, H1, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { Psp, Transaction } from "../../../../types/pagopa";
import { Dettaglio } from "../../../../../definitions/pagopa/Dettaglio";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import I18n from "../../../../i18n";
import {
  WalletTransactionRoutes,
  WalletTransactionStackNavigation
} from "../navigation/navigator";

import { WalletTransactionTotalAmount } from "./WalletTransactionTotalAmount";
import { WalletTransactionDetailsList } from "./WalletTransactionDetailsList";

type Props = {
  transaction?: Transaction;
  psp?: Psp;
  loading: boolean;
};

export const WalletTransactionHeadingSection = ({
  transaction,
  psp,
  loading
}: Props) => {
  const navigation = useNavigation<WalletTransactionStackNavigation>();

  const handlePressTransactionDetails = (operationDetails: Dettaglio) => {
    if (transaction) {
      navigation.navigate(
        WalletTransactionRoutes.WALLET_TRANSACTION_OPERATION_DETAILS,
        {
          operationDetails,
          operationName: transaction.description
        }
      );
    }
  };

  const FeeAmountSection = () => {
    if (psp && transaction && transaction.fee && !loading) {
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
    if (loading) {
      return (
        <View style={IOStyles.flex}>
          <VSpacer size={4} />
          <Placeholder.Line width="100%" animate="fade" />
          <VSpacer size={8} />
          <Placeholder.Line width="50%" animate="fade" />
        </View>
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
      <WalletTransactionDetailsList
        transaction={transaction}
        loading={loading}
        onPress={handlePressTransactionDetails}
      />
      <WalletTransactionTotalAmount
        loading={loading}
        totalAmount={transaction?.grandTotal.amount}
      />
      <VSpacer size={8} />
      <FeeAmountSection />
      <VSpacer size={8} />
    </View>
  );
};
