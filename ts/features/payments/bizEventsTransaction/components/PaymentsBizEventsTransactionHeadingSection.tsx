import _ from "lodash";
import {
  Body,
  IOColors,
  IOStyles,
  useIOTheme,
  VSpacer,
  VStack
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import Placeholder from "rn-placeholder";
import { CartItem } from "../../../../../definitions/pagopa/biz-events/CartItem";
import I18n from "../../../../i18n";
import { Psp } from "../../../../types/pagopa";
import { calculateTotalAmount, formatAmountText } from "../utils";
import { PaymentsTransactionBizEventsStackNavigation } from "../navigation/navigator";
import { PaymentsTransactionBizEventsRoutes } from "../navigation/routes";
import { NoticeDetailResponse } from "../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { PaymentsBizEventsTransactionCartList } from "./PaymentsBizEventsTransactionCartList";
import { PaymentsBizEventsTransactionTotalAmount } from "./PaymentsBizEventsTransactionTotalAmount";

type Props = {
  transaction?: NoticeDetailResponse;
  psp?: Psp;
  isLoading: boolean;
};

export const PaymentsBizEventsTransactionHeadingSection = ({
  transaction,
  isLoading
}: Props) => {
  const navigation =
    useNavigation<PaymentsTransactionBizEventsStackNavigation>();

  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-primary"]];

  const transactionInfo = transaction?.infoNotice;

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
    const pspName = transactionInfo?.pspName;
    if (transactionInfo?.fee !== undefined) {
      const formattedFee = formatAmountText(transactionInfo.fee);
      return (
        <Body>
          {I18n.t("transaction.details.totalFee")}{" "}
          <Body weight="Semibold">{formattedFee}</Body>{" "}
          {pspName
            ? // we want to make sure no empty string is passed either
              I18n.t("transaction.details.totalFeePsp", {
                pspName
              })
            : I18n.t("transaction.details.totalFeeNoPsp")}
        </Body>
      );
    }
    return (
      <Body>
        {pspName
          ? I18n.t("features.payments.transactions.details.totalFeeUnknown", {
              pspName
            })
          : I18n.t("features.payments.transactions.details.totalFeeUnknownPsp")}
      </Body>
    );
  };

  const totalAmount = calculateTotalAmount(transactionInfo);

  return (
    <View style={[IOStyles.horizontalContentPadding, { backgroundColor }]}>
      <PaymentsBizEventsTransactionCartList
        carts={transaction?.carts}
        loading={isLoading}
        onPress={handlePressTransactionDetails}
      />
      <VSpacer size={8} />
      <VStack space={8}>
        <PaymentsBizEventsTransactionCartList
          carts={transaction?.carts}
          loading={isLoading}
          onPress={handlePressTransactionDetails}
        />
        {totalAmount && (
          <PaymentsBizEventsTransactionTotalAmount
            loading={isLoading}
            totalAmount={totalAmount}
          />
        )}
        <FeeAmountSection />
      </VStack>
    </View>
  );
};
