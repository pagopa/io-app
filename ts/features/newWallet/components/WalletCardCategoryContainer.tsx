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
  const renderCardFn = (card: WalletCard) => {
    const Component = walletCardComponentMapper[card.type];
    return Component && <Component {...card} />;
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
