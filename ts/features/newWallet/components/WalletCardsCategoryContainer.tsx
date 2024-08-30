import {
  ListItemHeader,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import * as React from "react";
import Animated, {
  FadeInDown,
  FadeOutDown,
  LinearTransition
} from "react-native-reanimated";
import { WalletCard } from "../types";
import { renderWalletCardFn } from "../utils";

export type WalletCardsCategoryContainerProps = WithTestID<{
  cards: ReadonlyArray<WalletCard>;
  isStacked?: boolean;
  header?: ListItemHeader;
  footer?: JSX.Element;
}>;

/**
 * This component handles the rendering of cards of a specific category.
 * The component also handles logic behind card stacking and animations
 */
export const WalletCardsCategoryContainer = ({
  cards,
  isStacked = false,
  header,
  footer,
  testID
}: WalletCardsCategoryContainerProps) => (
  <Animated.View testID={testID} layout={LinearTransition.duration(200)}>
    {header && <ListItemHeader {...header} />}
    <Animated.FlatList
      scrollEnabled={false}
      data={cards}
      ItemSeparatorComponent={() => (!isStacked ? <VSpacer size={16} /> : null)}
      renderItem={({ index, item }) =>
        renderWalletCardFn(item, isStacked && index < cards.length - 1)
      }
      itemLayoutAnimation={LinearTransition.duration(200)}
      entering={FadeInDown.duration(150)}
      exiting={FadeOutDown.duration(150)}
    />
    {React.isValidElement(footer) && React.cloneElement(footer)}
    <VSpacer size={24} />
  </Animated.View>
);
