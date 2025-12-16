import {
  ContentWrapper,
  IOColors,
  useIOTheme,
  VStack
} from "@pagopa/io-app-design-system";
import { useNavigation } from "@react-navigation/native";
import { CartItem } from "../../../../../definitions/pagopa/biz-events/CartItem";
import { NoticeDetailResponse } from "../../../../../definitions/pagopa/biz-events/NoticeDetailResponse";
import { Psp } from "../../../../types/pagopa";
import { ReceiptStackNavigation } from "../navigation/navigator";
import { PaymentsReceiptRoutes } from "../navigation/routes";
import { calculateTotalAmount } from "../utils";
import { ReceiptCartList } from "./ReceiptCartList";
import ReceiptFeeAmountSection from "./ReceiptFeeAmountSection";
import { ReceiptTotalAmount } from "./ReceiptTotalAmount";

type Props = {
  transaction?: NoticeDetailResponse;
  psp?: Psp;
  isLoading: boolean;
};

export const ReceiptHeadingSection = ({ transaction, isLoading }: Props) => {
  const navigation = useNavigation<ReceiptStackNavigation>();

  const theme = useIOTheme();
  const backgroundColor = IOColors[theme["appBackground-primary"]];

  const transactionInfo = transaction?.infoNotice;

  const handlePressTransactionDetails = (cartItem: CartItem) => {
    if (transaction) {
      navigation.navigate(
        PaymentsReceiptRoutes.PAYMENT_RECEIPT_CART_ITEM_DETAILS,
        {
          cartItem
        }
      );
    }
  };

  const totalAmount = calculateTotalAmount(transactionInfo);

  return (
    <ContentWrapper style={{ backgroundColor }}>
      <VStack space={8}>
        <ReceiptCartList
          carts={transaction?.carts}
          loading={isLoading}
          onPress={handlePressTransactionDetails}
        />
        {totalAmount && (
          <ReceiptTotalAmount loading={isLoading} totalAmount={totalAmount} />
        )}
        <ReceiptFeeAmountSection
          loading={isLoading}
          transactionInfo={transactionInfo}
        />
      </VStack>
    </ContentWrapper>
  );
};
