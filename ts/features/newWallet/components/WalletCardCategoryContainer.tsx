import { IOIcons, ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { WalletCard, walletCardComponentMapper } from "../types";

type WalletCategoryStackContainerProps = {
  iconName: IOIcons;
  label: string;
  cards: ReadonlyArray<WalletCard>;
};

/**
 * This component handles the rendering of cards of a specific category.
 * The component also handles logic behind card stacking and animations
 */
const WalletCardCategoryContainer = ({
  label,
  iconName,
  cards
}: WalletCategoryStackContainerProps) => {
  if (cards === undefined || cards.length === 0) {
    // If cards are not provided or are an empty array, the component should not render
    return null;
  }

  const isStacked = cards.length > 1;

  const renderCardFn = (card: WalletCard, stacked: boolean) => {
    const Component = walletCardComponentMapper[card.type];
    return Component && <Component cardProps={card} isStacked={stacked} />;
  };

  return (
    <View>
      <ListItemHeader iconName={iconName} label={label} />
      {cards.map((card, index) => (
        <>
          {!isStacked && index !== 0 && <VSpacer size={16} />}
          {renderCardFn(card, isStacked && index < cards.length - 1)}
        </>
      ))}
    </View>
  );
};

export { WalletCardCategoryContainer };
