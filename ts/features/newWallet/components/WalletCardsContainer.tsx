import * as React from "react";
import { View } from "react-native";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import { getWalletCardsByCategorySelector } from "../store/selectors";
import { WalletCardCategory, walletCardCategoryIcons } from "../types";
import { WalletCardsCategoryContainer } from "./WalletCardsCategoryContainer";

const WalletCardsContainer = () => {
  const cardsByCategory = useIOSelector(getWalletCardsByCategorySelector);

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
