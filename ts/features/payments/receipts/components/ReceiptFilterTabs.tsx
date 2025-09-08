import {
  IOVisualCostants,
  TabItem,
  TabNavigation,
  VSpacer
} from "@pagopa/io-app-design-system";
import { StyleSheet, View } from "react-native";
import I18n from "i18next";
import { ReceiptsCategoryFilter, receiptsCategoryFilters } from "../types";

type Props = {
  selectedCategory: ReceiptsCategoryFilter;
  onCategorySelected?: (category: ReceiptsCategoryFilter) => void;
};

const ReceiptFilterTabs = ({ selectedCategory, onCategorySelected }: Props) => {
  const selectedIndexOfCategory =
    receiptsCategoryFilters.indexOf(selectedCategory);

  const handleFilterSelected = (index: number) => {
    const categoryByIndex = receiptsCategoryFilters[index];
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
        {receiptsCategoryFilters.map((category, index) => (
          <TabItem
            testID={`CategoryTabTestID-${category}`}
            key={category}
            label={I18n.t(
              `features.payments.transactions.filters.tabs.${category}`
            )}
            accessibilityLabel={`${I18n.t(
              `features.payments.transactions.filters.tabs.${category}`
            )}, ${I18n.t("global.accessibility.progressTracker", {
              index: index + 1,
              total: receiptsCategoryFilters.length
            })}`}
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

export { ReceiptFilterTabs };
