import * as React from "react";
import { View } from "react-native";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import {
  getWalletCardsByCategoryWithFilterSelector,
  selectWalletCards
} from "../store/selectors";
import { getWalletPlaceholdersByCategorySelector } from "../store/selectors/placeholders";
import { WalletCardCategory, walletCardCategoryIcons } from "../types";
import { renderWalletCardFn } from "../utils";
import { WalletCardSkeleton } from "./WalletCardSkeleton";
import {
  WalletCardsCategoryContainer,
  WalletCardsCategoryContainerSkeleton
} from "./WalletCardsCategoryContainer";
import { WalletEmptyScreenContent } from "./WalletEmptyScreenContent";

const WalletCardsContainer = () => {
  const cards = useIOSelector(selectWalletCards);
  const cardsByCategory = useIOSelector(
    getWalletCardsByCategoryWithFilterSelector
  );
  const placeholdersByCategory = useIOSelector(
    getWalletPlaceholdersByCategorySelector
  );
  const placeholders = Object.values(placeholdersByCategory);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (cards.length > 0) {
      setIsLoading(false);
    } else if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [isLoading, cards, setIsLoading]);

  if ((isLoading && placeholders.length === 0) || placeholders.length === 1) {
    return <WalletCardSkeleton cardProps={{}} isStacked={false} />;
  }

  if (cards.length === 0 && placeholders.length === 0) {
    return <WalletEmptyScreenContent />;
  }

  if (cards.length === 1 && placeholders.length === 0) {
    // Single card doesn't require grouping
    return renderWalletCardFn(cards[0]);
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
      {Object.entries(placeholdersByCategory).map(([categoryString, cards]) => {
        const category = categoryString as WalletCardCategory;

        return (
          <WalletCardsCategoryContainerSkeleton
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
