import {
  IOVisualCostants,
  TabItem,
  TabNavigation,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
// import I18n from "../../../i18n";
// import { useIODispatch, useIOSelector } from "../../../store/hooks";

const PaymentsBizEventsFilterTabs = () => {
  // const dispatch = useIODispatch();

  // const selectedCategory = useIOSelector(selectWalletCategoryFilter);

  // const selectedIndex = selectedCategory
  //   ? walletCardCategoryFilters.indexOf(selectedCategory) + 1
  //   : 0;

  const handleFilterSelected = (index: number) => {
    // const categoryByIndex =
    //   index === 0 ? undefined : walletCardCategoryFilters[index - 1];
    // dispatch(walletSetCategoryFilter(categoryByIndex));
    // if (categoryByIndex) {
    //   trackWalletCategoryFilter(categoryByIndex);
    // }
  };

  return (
    <View style={styles.container} testID="CategoryTabsContainerTestID">
      <TabNavigation
        tabAlignment="start"
        onItemPress={handleFilterSelected}
        selectedIndex={0}
      >
        <TabItem
          key={`category_tab_all`}
          label={"Tutte"}
          accessibilityLabel={"Tutte"}
        />
        <TabItem
          key={`category_tab_payer`}
          label="Pagate da me"
          accessibilityLabel="Pagate da me"
        />
        <TabItem
          key={`category_tab_debtor`}
          label="Intestate a me"
          accessibilityLabel="Intestate a me"
        />
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

export { PaymentsBizEventsFilterTabs };
