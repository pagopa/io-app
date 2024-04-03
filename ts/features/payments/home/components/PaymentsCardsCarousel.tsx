import { HSpacer, IOVisualCostants } from "@pagopa/io-app-design-system";
import * as React from "react";
import { FlatListProps, StyleSheet } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { WithTestID } from "../../../../types/WithTestID";
import {
  PaymentCardSmall,
  PaymentCardSmallProps,
  PaymentCardSmallSkeleton
} from "../../common/components/PaymentCardSmall";

export type PaymentCardsCarouselProps = WithTestID<{
  cards: Array<PaymentCardSmallProps>;
}>;

const PaymentCardsCarouselBaseComponent = <T,>({
  data,
  renderItem,
  testID
}: WithTestID<FlatListProps<T>>) => (
  <FlatList
    horizontal={true}
    testID={testID}
    ItemSeparatorComponent={() => <HSpacer size={8} />}
    data={data}
    style={style.list}
    renderItem={renderItem}
    ListFooterComponent={() => <HSpacer size={48} />}
    showsHorizontalScrollIndicator={false}
    keyExtractor={(_, index) => `home_payment_card_${index.toString()}`}
  />
);

const PaymentCardsCarousel = ({ cards, testID }: PaymentCardsCarouselProps) => (
  <PaymentCardsCarouselBaseComponent
    testID={testID}
    data={cards}
    renderItem={({ item }) => <PaymentCardSmall {...item} />}
  />
);

const PaymentCardsCarouselSkeleton = ({ testID }: WithTestID<any>) => (
  <PaymentCardsCarouselBaseComponent
    testID={testID}
    data={Array.from({ length: 3 })}
    renderItem={() => <PaymentCardSmallSkeleton />}
  />
);

const style = StyleSheet.create({
  list: {
    marginHorizontal: -IOVisualCostants.appMarginDefault,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

export { PaymentCardsCarousel, PaymentCardsCarouselSkeleton };
