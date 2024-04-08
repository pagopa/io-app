import * as React from "react";
import { View } from "react-native";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import {
  getWalletCardsByCategorySelector,
  selectWalletCards
} from "../store/selectors";
import {
  WalletCardCategory,
  walletCardCategoryIcons,
  walletCardComponentMapper
} from "../types";
import { WalletCardsCategoryContainer } from "./WalletCardsCategoryContainer";

const WalletCardsContainer = () => {
  const cards = useIOSelector(selectWalletCards);
  const cardsByCategory = useIOSelector(getWalletCardsByCategorySelector);

  if (cards.length === 1) {
    // Single card does not need grouping
    const card = cards[0];
    const Component = walletCardComponentMapper[card.type];
    return (
      Component && (
        <Component testID={`walletCardTestID_${card.key}`} cardProps={card} />
      )
    );
  }

  return (
    <View testID="walletCardsContainerTestID">
      {Object.entries(cardsByCategory).map(([categoryString, cards]) => {
        const category = categoryString as WalletCardCategory;

        return (
          <WalletCardsCategoryContainer
            key={`cards_category_${category}`}
            testID={`walletCardsCategoryTestID_${category}`}
            iconName={walletCardCategoryIcons[category]}
            label={I18n.t(`features.wallet.cards.categories.${category}`)}
            cards={cards}
          />
        );
      })}
    </View>
  );
};

export { WalletCardsContainer };
