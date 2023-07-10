import * as React from "react";
import { FlatList } from "react-native-gesture-handler";
import { WithTestID } from "../../../../types/WithTestID";
import { HSpacer } from "../../../core/spacer/Spacer";
import { PaymentCardSmall, PaymentCardSmallProps } from "./PaymentCardSmall";

export type PaymentCardsCarouselProps = WithTestID<{
  cards: Array<PaymentCardSmallProps>;
}>;

export const PaymentCardsCarousel = ({
  cards,
  testID
}: PaymentCardsCarouselProps) => (
  <FlatList
    horizontal={true}
    testID={testID}
    ItemSeparatorComponent={() => <HSpacer size={8} />}
    data={cards}
    style={{ paddingBottom: 8 }}
    renderItem={({ item }) => <PaymentCardSmall {...item} />}
    keyExtractor={(_, index) => index.toString()}
  ></FlatList>
);
