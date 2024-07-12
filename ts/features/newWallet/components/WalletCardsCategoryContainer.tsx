import {
  ListItemHeader,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import * as React from "react";
import Animated, { LinearTransition } from "react-native-reanimated";
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
    {cards.map((card, index) => (
      <React.Fragment key={`wallet_card_${card.key}`}>
        {!isStacked && index !== 0 && <VSpacer size={16} />}
        {renderWalletCardFn(card, isStacked && index < cards.length - 1)}
      </React.Fragment>
    ))}
    {React.isValidElement(footer) && React.cloneElement(footer)}
    <VSpacer size={24} />
  </Animated.View>
);
