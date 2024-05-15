import { Body, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { Dettaglio } from "../../../../../definitions/pagopa/Dettaglio";
import I18n from "../../../../i18n";
import { Psp, Transaction } from "../../../../types/pagopa";
import { formatNumberCentsToAmount } from "../../../../utils/stringBuilder";
import { PaymentsTransactionBizEventsStackNavigation } from "../navigation/navigator";
import { PaymentsTransactionBizEventsRoutes } from "../navigation/routes";
import { WalletBizEventsTransactionDetailsList } from "./WalletBizEventsTransactionDetailsList";
import { WalletBizEventsTransactionTotalAmount } from "./WalletBizEventsTransactionTotalAmount";

type Props = {
  transaction?: Transaction;
  psp?: Psp;
  isLoading: boolean;
};

export const WalletBizEventsTransactionHeadingSection = ({
  transaction,
  psp,
  isLoading
}: Props) => {
  const navigation =
    useNavigation<PaymentsTransactionBizEventsStackNavigation>();

  const handlePressTransactionDetails = (operationDetails: Dettaglio) => {
    if (transaction) {
      navigation.navigate(
        PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_OPERATION_DETAILS,
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
    if (transaction?.fee !== undefined) {
      const formattedFee = formatNumberCentsToAmount(
        transaction.fee.amount,
        true,
        "right"
      );
      return (
        <Body>
          {I18n.t("transaction.details.totalFee")}{" "}
          <Body weight="Medium">{formattedFee}</Body>{" "}
          {psp?.businessName
            ? // we want to make sure no empty string is passed either
              I18n.t("transaction.details.totalFeePsp", {
                pspName: psp.businessName
              })
            : I18n.t("transaction.details.totalFeeNoPsp")}
        </Body>
      );
    }
    return <></>;
  };

  return (
    <View style={[IOStyles.horizontalContentPadding, IOStyles.bgWhite]}>
      <VSpacer size={16} />
      <WalletBizEventsTransactionDetailsList
        transaction={transaction}
        loading={isLoading}
        onPress={handlePressTransactionDetails}
      />
      <VSpacer size={8} />
      <WalletBizEventsTransactionTotalAmount
        loading={isLoading}
        totalAmount={transaction?.grandTotal.amount}
      />
      <VSpacer size={8} />
      <FeeAmountSection />
      <VSpacer size={8} />
    </View>
  );
};
