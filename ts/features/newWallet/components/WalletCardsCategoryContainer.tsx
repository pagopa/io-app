import { VSpacer, WithTestID } from "@pagopa/io-app-design-system";
import * as React from "react";
import Animated, { Layout } from "react-native-reanimated";
import { WalletCard } from "../types";
import { renderWalletCardFn } from "../utils";

export type WalletCardsCategoryContainerProps = WithTestID<{
  cards: ReadonlyArray<WalletCard>;
  isStacked?: boolean;
}>;

/**
 * This component handles the rendering of cards of a specific category.
 * The component also handles logic behind card stacking and animations
 */
export const WalletCardsCategoryContainer = ({
  cards,
  isStacked = false,
  testID
}: WalletCardsCategoryContainerProps) => (
  <Animated.View testID={testID} layout={Layout.duration(200)}>
    {cards.map((card, index) => (
      <React.Fragment key={`wallet_card_${card.key}`}>
        {!isStacked && index !== 0 && <VSpacer size={16} />}
        {renderWalletCardFn(card, isStacked && index < cards.length - 1)}
      </React.Fragment>
    ))}
    <VSpacer size={24} />
  </Animated.View>
);
