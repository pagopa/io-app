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
  topElement?: JSX.Element;
}>;

/**
 * This component handles the rendering of cards of a specific category.
 * The component also handles logic behind card stacking and animations
 */
export const WalletCardsCategoryContainer = ({
  cards,
  isStacked = false,
  header,
  topElement,
  testID
}: WalletCardsCategoryContainerProps) => (
  <Animated.View testID={testID} layout={LinearTransition.duration(200)}>
    {header && <ListItemHeader {...header} />}
    {React.isValidElement(topElement) && React.cloneElement(topElement)}
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
    <VSpacer size={24} />
  </Animated.View>
);
