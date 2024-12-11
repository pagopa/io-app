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
import { PaymentsNoticeStackNavigation } from "../navigation/navigator";
import { PaymentsNoticeRoutes } from "../navigation/routes";
import { calculateTotalAmount } from "../utils";
import { NoticeCartList } from "./NoticeCartList";
import NoticeFeeAmountSection from "./NoticeFeeAmountSection";
import { NoticeTotalAmount } from "./NoticeTotalAmount";

type Props = {
  transaction?: NoticeDetailResponse;
  psp?: Psp;
  isLoading: boolean;
};

export const NoticeHeadingSection = ({ transaction, isLoading }: Props) => {
  const navigation = useNavigation<PaymentsNoticeStackNavigation>();

  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-primary"]];

  const transactionInfo = transaction?.infoNotice;

  const handlePressTransactionDetails = (cartItem: CartItem) => {
    if (transaction) {
      navigation.navigate(
        PaymentsNoticeRoutes.PAYMENT_NOTICE_CART_ITEM_DETAILS,
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
        <NoticeCartList
          carts={transaction?.carts}
          loading={isLoading}
          onPress={handlePressTransactionDetails}
        />
        {totalAmount && (
          <NoticeTotalAmount loading={isLoading} totalAmount={totalAmount} />
        )}
        <NoticeFeeAmountSection
          loading={isLoading}
          transactionInfo={transactionInfo}
        />
      </VStack>
    </View>
  );
};
