import {
  IOVisualCostants,
  TabItem,
  TabNavigation
} from "@io-app/design-system";
import I18n from "i18next";
import { useMemo } from "react";
import { StyleSheet, View } from "react-native";

import { useDebugInfo } from "../../../hooks/useDebugInfo";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { trackWalletCategoryFilter } from "../../itwallet/analytics";
import { walletSetCategoryFilter } from "../store/actions/preferences";
import {
  isWalletCategoryFilteringEnabledSelector,
  selectWalletCategoryFilter
} from "../store/selectors";
import { WalletCardCategoryFilter, walletCardCategoryFilters } from "../types";

/**
 * Renders filter tabs to categorize cards on the wallet home screen.
 * The tabs allow users to filter between different wallet categories like ITW, payments and bonus cards.
 * Automatically hides when only one category is available to avoid unnecessary UI clutter.
 */
const WalletCategoryFilterTabs = () => {
  const dispatch = useIODispatch();

  const categoryFilter = useIOSelector(selectWalletCategoryFilter);
  const isFilteringEnabled = useIOSelector(
    isWalletCategoryFilteringEnabledSelector
  );

  useDebugInfo({
    wallet: {
      isFilteringEnabled,
      categoryFilter
    }
  });

  const selectedIndex = useMemo(
    () =>
      categoryFilter
        ? walletCardCategoryFilters.indexOf(categoryFilter) + 1
        : 0,
    [categoryFilter]
  );

  const categoryLabels = useMemo(
    (): Record<WalletCardCategoryFilter, string> => ({
      itw: I18n.t("features.wallet.cards.categories.itw"),
      other: I18n.t("features.wallet.cards.categories.other")
    }),
    []
  );

  if (!isFilteringEnabled) {
    return null;
  }

  const handleFilterSelected = (index: number) => {
    const categoryByIndex =
      index === 0 ? undefined : walletCardCategoryFilters[index - 1];
    dispatch(walletSetCategoryFilter(categoryByIndex));
    if (categoryByIndex) {
      trackWalletCategoryFilter(categoryByIndex);
    }
  };

  return (
    <View style={styles.container} testID="CategoryTabsContainerTestID">
      <TabNavigation
        onItemPress={handleFilterSelected}
        selectedIndex={selectedIndex}
        tabAlignment="start"
      >
        {[
          <TabItem
            accessibilityLabel={I18n.t("features.wallet.cards.categories.all")}
            key={`category_tab_all`}
            label={I18n.t("features.wallet.cards.categories.all")}
          />,
          ...walletCardCategoryFilters.map(category => (
            <TabItem
              accessibilityLabel={categoryLabels[category]}
              key={`category_tab_${category}`}
              label={categoryLabels[category]}
              testID={`CategoryTabTestID-${category}`}
            />
          ))
        ]}
      </TabNavigation>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 8,
    marginHorizontal: -IOVisualCostants.appMarginDefault * 2,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

export { WalletCategoryFilterTabs };
