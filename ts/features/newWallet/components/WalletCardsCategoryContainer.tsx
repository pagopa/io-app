import {
  IOIcons,
  ListItemHeader,
  VSpacer,
  WithTestID
} from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { WalletCard } from "../types";
import { renderWalletCardFn } from "../utils";

export type WalletCategoryStackContainerProps = WithTestID<{
  iconName: IOIcons;
  label: string;
  cards: ReadonlyArray<WalletCard>;
}>;

/**
 * This component handles the rendering of cards of a specific category.
 * The component also handles logic behind card stacking and animations
 */
const WalletCardsCategoryContainer = ({
  label,
  iconName,
  cards,
  testID
}: WalletCategoryStackContainerProps) => {
  if (cards === undefined || cards.length === 0) {
    // If cards are not provided or are an empty array, the component should not render
    return null;
  }

  const isStacked = cards.length > 1;

  return (
    <View testID={testID}>
      <ListItemHeader iconName={iconName} label={label} />
      {cards.map((card, index) => (
        <React.Fragment key={`wallet_card_${card.key}`}>
          {!isStacked && index !== 0 && <VSpacer size={16} />}
          {renderWalletCardFn(card, isStacked && index < cards.length - 1)}
        </React.Fragment>
      ))}
      <VSpacer size={16} />
    </View>
  );
};

export { WalletCardsCategoryContainer };
