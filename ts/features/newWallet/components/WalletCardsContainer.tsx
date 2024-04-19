import * as React from "react";
import { View } from "react-native";
import I18n from "../../../i18n";
import { useIOSelector } from "../../../store/hooks";
import {
  selectIsWalletCardsLoading,
  selectWalletCards,
  selectWalletCardsByCategoryWithFilter,
  selectWalletCategoriesIncludingPlaceholders,
  selectWalletPlaceholdersByCategory
} from "../store/selectors";
import { walletCardCategoryIcons } from "../types";
import { renderWalletCardFn } from "../utils";
import { WalletCardSkeleton } from "./WalletCardSkeleton";
import {
  WalletCardsCategoryContainer,
  WalletCardsCategoryContainerSkeleton
} from "./WalletCardsCategoryContainer";
import { WalletEmptyScreenContent } from "./WalletEmptyScreenContent";

const WalletCardsContainer = () => {
  const isLoading = useIOSelector(selectIsWalletCardsLoading);
  const cards = useIOSelector(selectWalletCards);
  const cardsByCategory = useIOSelector(selectWalletCardsByCategoryWithFilter);
  const placeholdersByCategory = useIOSelector(
    selectWalletPlaceholdersByCategory
  );
  const categories = useIOSelector(selectWalletCategoriesIncludingPlaceholders);
  const placeholders = Object.values(placeholdersByCategory);

  if (isLoading && categories.length === 0) {
    return (
      <WalletCardSkeleton
        testID="walletCardSkeletonTestID"
        cardProps={{}}
        isStacked={false}
      />
    );
  }

  if (categories.length === 0) {
    // In this case we can display the empty state: we do not have categories to display and
    // the wallet is not in a loading state anymore
    return <WalletEmptyScreenContent />;
  }

  if (cards.length === 1 && placeholders.length === 0) {
    // Single card doesn't require grouping
    return renderWalletCardFn(cards[0]);
  }

  return (
    <View testID="walletCardsContainerTestID">
      {categories.map(category => {
        const iconName = walletCardCategoryIcons[category];
        const label = I18n.t(`features.wallet.cards.categories.${category}`);

        const cards = cardsByCategory[category];
        const placeholders = placeholdersByCategory[category];

        if (cards) {
          return (
            <WalletCardsCategoryContainer
              key={`cards_category_${category}`}
              testID={`walletCardsCategoryTestID_${category}`}
              iconName={iconName}
              label={label}
              cards={cards}
            />
          );
        }

        if (placeholders) {
          return (
            <WalletCardsCategoryContainerSkeleton
              key={`cards_category_skeleton_${category}`}
              testID={`walletCardsCategorySkeletonTestID_${category}`}
              iconName={iconName}
              label={label}
              cards={placeholders}
            />
          );
        }

        return null;
      })}
    </View>
  );
};

export { WalletCardsContainer };
