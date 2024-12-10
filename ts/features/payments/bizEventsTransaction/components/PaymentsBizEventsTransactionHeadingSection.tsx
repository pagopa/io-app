import {
  IOColors,
  IOStyles,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { CartItem } from "../../../../../definitions/pagopa/biz-events/CartItem";
import { NoticeDetailResponse } from "../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { Psp } from "../../../../types/pagopa";
import { PaymentsTransactionBizEventsStackNavigation } from "../navigation/navigator";
import { PaymentsTransactionBizEventsRoutes } from "../navigation/routes";
import { calculateTotalAmount } from "../utils";
import { PaymentsBizEventsTransactionCartList } from "./PaymentsBizEventsTransactionCartList";
import PaymentsBizEventsTransactionFeeAmountSection from "./PaymentsBizEventsTransactionFeeAmountSection";
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

  const totalAmount = calculateTotalAmount(transactionInfo);

  return (
    <View style={[IOStyles.horizontalContentPadding, { backgroundColor }]}>
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
        <PaymentsBizEventsTransactionFeeAmountSection
          loading={isLoading}
          transactionInfo={transactionInfo}
        />
      </VStack>
    </View>
  );
};
