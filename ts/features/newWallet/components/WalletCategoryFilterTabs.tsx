import {
  IOVisualCostants,
  TabItem,
  TabNavigation,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import I18n from "../../../i18n";
import { useIODispatch, useIOSelector } from "../../../store/hooks";
import { walletSetCategoryFilter } from "../store/actions/preferences";
import {
  getWalletCardsByCategorySelector,
  selectWalletCategoryFilter
} from "../store/selectors";
import { WalletCardCategory, walletCardCategoryIcons } from "../types";

const WalletCategoryFilterTabs = () => {
  const dispatch = useIODispatch();

  const cardsByCategory = useIOSelector(getWalletCardsByCategorySelector);
  const selectedCategory = useIOSelector(selectWalletCategoryFilter);

  const categories = Object.keys(
    cardsByCategory
  ) as ReadonlyArray<WalletCardCategory>;

  const selectedIndex = selectedCategory
    ? categories.indexOf(selectedCategory) + 1
    : 0;

  const handleFilterSelected = (index: number) => {
    dispatch(
      walletSetCategoryFilter(index === 0 ? undefined : categories[index - 1])
    );
  };

  if (categories.length < 2) {
    // There is no need to show category filter if we have less than 2 categories
    return null;
  }

  return (
    <View style={styles.container} testID="CategoryTabsContainerTestID">
      <TabNavigation
        tabAlignment="start"
        onItemPress={handleFilterSelected}
        selectedIndex={selectedIndex}
      >
        {[
          <TabItem
            key={`category_tab_all`}
            label={I18n.t(`features.wallet.cards.categories.all`)}
            accessibilityLabel={I18n.t(`features.wallet.cards.categories.all`)}
          />,
          ...categories.map(category => (
            <TabItem
              testID={`CategoryTabTestID-${category}`}
              key={`category_tab_${category}`}
              label={I18n.t(`features.wallet.cards.categories.${category}`)}
              accessibilityLabel={I18n.t(
                `features.wallet.cards.categories.${category}`
              )}
              icon={walletCardCategoryIcons[category]}
            />
          ))
        ]}
      </TabNavigation>
      <VSpacer size={16} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -IOVisualCostants.appMarginDefault * 2,
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

export { WalletCategoryFilterTabs };
