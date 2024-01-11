import { useNavigation } from "@react-navigation/native";
import Placeholder from "rn-placeholder";
import React from "react";
import { View } from "react-native";
import { Body, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
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
  isLoading: boolean;
};

export const WalletTransactionHeadingSection = ({
  transaction,
  psp,
  isLoading
}: Props) => {
  const navigation = useNavigation<WalletTransactionStackNavigation>();

  const handlePressTransactionDetails = (operationDetails: Dettaglio) => {
    if (transaction) {
      navigation.navigate(
        WalletTransactionRoutes.WALLET_TRANSACTION_OPERATION_DETAILS,
        {
          operationDetails,
          operationSubject: transaction.description,
          operationName: transaction.description
        }
      );
    }
  };

  const FeeAmountSection = () => {
    if (isLoading) {
      return (
        <View style={IOStyles.flex}>
          <VSpacer size={4} />
          <Placeholder.Line width="100%" animate="fade" />
          <VSpacer size={8} />
          <Placeholder.Line width="50%" animate="fade" />
        </View>
      );
    }
    if (psp && transaction?.fee) {
      const formattedFee = formatNumberCentsToAmount(
        transaction.fee.amount,
        true,
        "right"
      );
      return (
        <Body>
          {I18n.t("transaction.details.totalFee")}{" "}
          <Body weight="Medium">{formattedFee}</Body>{" "}
          {psp.businessName
            ? // we want to make sure no empty string is passed either
              I18n.t("transaction.details.totalFeePsp", {
                pspName: psp.businessName
              })
            : I18n.t("transaction.details.totalFeeNoPsp")}
          .
        </Body>
      );
    }
    return <></>;
  };

  return (
    <View style={[IOStyles.horizontalContentPadding, IOStyles.bgWhite]}>
      <VSpacer size={16} />
      <WalletTransactionDetailsList
        transaction={transaction}
        loading={isLoading}
        onPress={handlePressTransactionDetails}
      />
      <VSpacer size={8} />
      <WalletTransactionTotalAmount
        loading={isLoading}
        totalAmount={transaction?.grandTotal.amount}
      />
      <VSpacer size={8} />
      <FeeAmountSection />
      <VSpacer size={8} />
    </View>
  );
};
