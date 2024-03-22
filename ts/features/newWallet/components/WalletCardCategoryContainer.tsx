import { IOIcons, ListItemHeader, VSpacer } from "@pagopa/io-app-design-system";
import * as React from "react";
import { View } from "react-native";
import { WalletCard, walletCardComponentMapper } from "../types";

type WalletCategoryStackContainerProps = {
  iconName: IOIcons;
  label: string;
  cards: ReadonlyArray<WalletCard>;
  stacked?: boolean;
};

/**
 * This component handles the rendering of cards of a specific category.
 * The component also handles logic behind card stacking and animations
 */
const WalletCardCategoryContainer = ({
  label,
  iconName,
  cards,
  stacked = false
}: WalletCategoryStackContainerProps) => {
  const renderCardFn = (card: WalletCard) => {
    const Component = walletCardComponentMapper[card.type];
    return Component && <Component cardProps={card} isStacked={stacked} />;
  };

  return (
    <View>
      <ListItemHeader iconName={iconName} label={label} />
      {cards.map((card, index) => (
        <>
          {index !== 0 && <VSpacer size={16} />}
          {renderCardFn(card)}
        </>
      ))}
    </View>
  );
};

export { WalletCardCategoryContainer };
