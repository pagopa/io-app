import * as React from "react";
import { StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { HSpacer, IOVisualCostants } from "@pagopa/io-app-design-system";
import { WithTestID } from "../../../../types/WithTestID";
import { generateFlatListItemLayout } from "../../utils/generateFlatListItemLayout";
import {
  PAYMENT_CARD_SMALL_WIDTH,
  PaymentCardSmall,
  PaymentCardSmallProps
} from "./PaymentCardSmall";

export type PaymentCardsCarouselProps = WithTestID<{
  cards: Array<PaymentCardSmallProps>;
}>;

const DIVIDER_WIDTH = 8;
const style = StyleSheet.create({
  list: {
    marginHorizontal: -IOVisualCostants.appMarginDefault,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

const generateCardsLayout = generateFlatListItemLayout(
  PAYMENT_CARD_SMALL_WIDTH,
  DIVIDER_WIDTH
);

export const PaymentCardsCarousel = ({
  cards,
  testID
}: PaymentCardsCarouselProps) => (
  <FlatList
    horizontal={true}
    testID={testID}
    ItemSeparatorComponent={() => <HSpacer size={DIVIDER_WIDTH} />}
    data={cards}
    style={style.list}
    renderItem={({ item }) => <PaymentCardSmall {...item} />}
    getItemLayout={(_, index) => generateCardsLayout(cards.length)(index)}
    ListFooterComponent={() => <HSpacer size={48} />}
    showsHorizontalScrollIndicator={false}
    keyExtractor={(_, index) => index.toString()}
  />
);
