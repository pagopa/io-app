import {
  IOVisualCostants,
  TabItem,
  TabNavigation,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  NoticeEventsCategoryFilter,
  noticeEventsCategoryFilters
} from "../types";
import I18n from "../../../../i18n";

type Props = {
  selectedCategory: NoticeEventsCategoryFilter;
  onCategorySelected?: (category: NoticeEventsCategoryFilter) => void;
};

const NoticeFilterTabs = ({ selectedCategory, onCategorySelected }: Props) => {
  const selectedIndexOfCategory =
    noticeEventsCategoryFilters.indexOf(selectedCategory);

  const handleFilterSelected = (index: number) => {
    const categoryByIndex = noticeEventsCategoryFilters[index];
    if (categoryByIndex !== selectedCategory) {
      onCategorySelected?.(categoryByIndex);
    }
  };

  return (
    <View style={styles.container}>
      <TabNavigation
        tabAlignment="start"
        onItemPress={handleFilterSelected}
        selectedIndex={selectedIndexOfCategory}
      >
        {noticeEventsCategoryFilters.map(category => (
          <TabItem
            testID={`CategoryTabTestID-${category}`}
            key={category}
            label={I18n.t(
              `features.payments.transactions.filters.tabs.${category}`
            )}
            accessibilityLabel={I18n.t(
              `features.payments.transactions.filters.tabs.${category}`
            )}
          />
        ))}
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

export { NoticeFilterTabs };
