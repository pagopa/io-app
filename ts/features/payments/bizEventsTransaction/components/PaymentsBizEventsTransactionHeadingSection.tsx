import _ from "lodash";
import { Body, IOStyles, VSpacer } from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { CartItem } from "../../../../../definitions/pagopa/biz-events/CartItem";
import I18n from "../../../../i18n";
import { TransactionDetailResponse } from "../../../../../definitions/pagopa/biz-events/TransactionDetailResponse";
import { Psp } from "../../../../types/pagopa";
import { formatAmountText } from "../utils";
import { PaymentsTransactionBizEventsStackNavigation } from "../navigation/navigator";
import { PaymentsTransactionBizEventsRoutes } from "../navigation/routes";
import { PaymentsBizEventsTransactionCartList } from "./PaymentsBizEventsTransactionCartList";
import { PaymentsBizEventsTransactionTotalAmount } from "./PaymentsBizEventsTransactionTotalAmount";

type Props = {
  transaction?: TransactionDetailResponse;
  psp?: Psp;
  isLoading: boolean;
};

export const PaymentsBizEventsTransactionHeadingSection = ({
  transaction,
  isLoading
}: Props) => {
  const navigation =
    useNavigation<PaymentsTransactionBizEventsStackNavigation>();

  const transactionInfo = transaction?.infoTransaction;

  const handlePressTransactionDetails = (cartItem: CartItem) => {
    if (transaction) {
      navigation.navigate(
        PaymentsTransactionBizEventsRoutes.PAYMENT_TRANSACTION_BIZ_EVENTS_CART_ITEM_DETAILS,
        {
          cartItem
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
    if (transactionInfo?.fee !== undefined) {
      const formattedFee = formatAmountText(transactionInfo.fee);
      return (
        <Body>
          {I18n.t("transaction.details.totalFee")}{" "}
          <Body weight="Medium">{formattedFee}</Body>{" "}
          {transactionInfo?.pspName
            ? // we want to make sure no empty string is passed either
              I18n.t("transaction.details.totalFeePsp", {
                pspName: transactionInfo.pspName
              })
            : I18n.t("transaction.details.totalFeeNoPsp")}
        </Body>
      );
    }
    return null;
  };

  const calculateTotalAmount = () => {
    if (transactionInfo?.amount && transactionInfo?.fee) {
      return (
        _.toNumber(transactionInfo.amount) + _.toNumber(transactionInfo.fee)
      ).toString();
    }
    return transactionInfo?.amount;
  };

  return (
    <View style={[IOStyles.horizontalContentPadding, IOStyles.bgWhite]}>
      <VSpacer size={16} />
      <PaymentsBizEventsTransactionCartList
        carts={transaction?.carts}
        loading={isLoading}
        onPress={handlePressTransactionDetails}
      />
      <VSpacer size={8} />
      <PaymentsBizEventsTransactionTotalAmount
        loading={isLoading}
        totalAmount={calculateTotalAmount()}
      />
      <VSpacer size={8} />
      <FeeAmountSection />
      <VSpacer size={8} />
    </View>
  );
};
