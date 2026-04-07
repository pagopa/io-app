import {
  HSpacer,
  IOSpacingScale,
  IOVisualCostants
} from "@pagopa/io-app-design-system";
import { FlatList, FlatListProps, StyleSheet } from "react-native";

import { WithTestID } from "../../../../types/WithTestID";
import {
  PAYMENT_CARD_SMALL_WIDTH,
  PaymentCardSmall,
  PaymentCardSmallProps,
  PaymentCardSmallSkeleton
} from "../../common/components/PaymentCardSmall";

export type PaymentCardsCarouselProps = WithTestID<{
  cards: Array<PaymentCardSmallProps>;
}>;

const PAYMENT_CARDS_SPACING: IOSpacingScale = 8;
const PAYMENT_CARD_TOTAL_WIDTH =
  PAYMENT_CARD_SMALL_WIDTH + PAYMENT_CARDS_SPACING;

const PaymentCardsCarouselBaseComponent = <T,>({
  data,
  ...props
}: WithTestID<FlatListProps<T>>) => (
  <FlatList
    {...props}
    data={data}
    getItemLayout={(_, index) => ({
      offset: PAYMENT_CARD_TOTAL_WIDTH * index,
      length: PAYMENT_CARD_TOTAL_WIDTH,
      index
    })}
    horizontal={true}
    ItemSeparatorComponent={() => <HSpacer size={PAYMENT_CARDS_SPACING} />}
    keyExtractor={(_, index) => `home_payment_card_${index.toString()}`}
    ListFooterComponent={() => <HSpacer size={48} />}
    showsHorizontalScrollIndicator={false}
    snapToAlignment="start"
    snapToInterval={PAYMENT_CARD_TOTAL_WIDTH}
    style={style.list}
  />
);

const PaymentCardsCarousel = ({ cards, testID }: PaymentCardsCarouselProps) => (
  <PaymentCardsCarouselBaseComponent
    data={cards}
    renderItem={({ item }) => <PaymentCardSmall {...item} />}
    testID={testID}
  />
);

const PaymentCardsCarouselSkeleton = ({ testID }: WithTestID<any>) => (
  <PaymentCardsCarouselBaseComponent
    data={Array.from({ length: 5 })}
    renderItem={() => <PaymentCardSmallSkeleton />}
    scrollEnabled={false}
    testID={testID}
  />
);

const style = StyleSheet.create({
  list: {
    marginHorizontal: -IOVisualCostants.appMarginDefault,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

export { PaymentCardsCarousel, PaymentCardsCarouselSkeleton };
