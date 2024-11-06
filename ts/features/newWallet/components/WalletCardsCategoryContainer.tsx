import { Platform } from "react-native";
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
import { WalletCardsCategoryRetryErrorBanner } from "./WalletCardsCategoryRetryErrorBanner";

export type WalletCardsCategoryContainerProps = WithTestID<{
  cards: ReadonlyArray<WalletCard>;
  header?: ListItemHeader;
  topElement?: JSX.Element;
}>;

// The item layout animation has a bug on Android for a FlatList that doesn't have a fixed height [https://github.com/software-mansion/react-native-reanimated/issues/5728]
// * The animations work perfectly when an item enters, but when removing an item, there is always a UI bug where the last item becomes invisible during rendering.
// * Even with an hardcoded height with the onLayout event, the bug is still present
// * The workaround is to disable the layout animation on Android
const itemLayoutAnimation =
  Platform.OS !== "android" ? LinearTransition.duration(200) : undefined;

/**
 * This component handles the rendering of cards of a specific category.
 * The component also handles logic behind card stacking and animations
 */
export const WalletCardsCategoryContainer = ({
  cards,
  header,
  topElement,
  testID
}: WalletCardsCategoryContainerProps) => {
  // Show the footer with the banner (if possible) to retry only if the category is of any domain of B&P (cgn, bonus or payment)
  const ListFooter = cards.find(card => card.category !== "itw") && (
    <>
      <VSpacer size={16} />
      <WalletCardsCategoryRetryErrorBanner />
    </>
  );

  return (
    <Animated.View testID={testID} layout={LinearTransition.duration(200)}>
      {header && <ListItemHeader {...header} />}
      {React.isValidElement(topElement) && React.cloneElement(topElement)}
      <Animated.FlatList
        scrollEnabled={false}
        data={cards}
        renderItem={({ index, item }) =>
          renderWalletCardFn(item, index < cards.length - 1)
        }
        ListFooterComponent={ListFooter}
        itemLayoutAnimation={itemLayoutAnimation}
        entering={FadeInDown.duration(150)}
        exiting={FadeOutDown.duration(150)}
      />
      <VSpacer size={24} />
    </Animated.View>
  );
};
