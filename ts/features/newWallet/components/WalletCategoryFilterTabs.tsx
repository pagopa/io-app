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
import { selectWalletCategoryFilter } from "../store/selectors";
import { walletCardCategoryFilters } from "../types";
import { itwLifecycleIsValidSelector } from "../../itwallet/lifecycle/store/selectors";
import { itwIsWalletEmptySelector } from "../../itwallet/credentials/store/selectors";
import { trackWalletCategoryFilter } from "../../itwallet/analytics";

const WalletCategoryFilterTabs = () => {
  const dispatch = useIODispatch();

  const selectedCategory = useIOSelector(selectWalletCategoryFilter);
  const isItwValid = useIOSelector(itwLifecycleIsValidSelector);
  const isWalletEmpty = useIOSelector(itwIsWalletEmptySelector);

  if (!isItwValid || isWalletEmpty) {
    return <VSpacer size={16} />;
  }

  const selectedIndex = selectedCategory
    ? walletCardCategoryFilters.indexOf(selectedCategory) + 1
    : 0;

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
          ...walletCardCategoryFilters.map(category => (
            <TabItem
              testID={`CategoryTabTestID-${category}`}
              key={`category_tab_${category}`}
              label={I18n.t(`features.wallet.cards.categories.${category}`)}
              accessibilityLabel={I18n.t(
                `features.wallet.cards.categories.${category}`
              )}
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
