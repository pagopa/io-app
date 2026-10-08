import {
  IOVisualCostants,
  TabItem,
  TabNavigation,
  VSpacer
} from "@io-app/design-system";
import I18n from "i18next";
import { StyleSheet, View } from "react-native";

import { ReceiptsCategoryFilter, receiptsCategoryFilters } from "../types";

type Props = {
  onCategorySelected?: (category: ReceiptsCategoryFilter) => void;
  selectedCategory: ReceiptsCategoryFilter;
};

const getCategoryLabel = (category: ReceiptsCategoryFilter): string => {
  switch (category) {
    case "all":
      return I18n.t("features.payments.transactions.filters.tabs.all");
    case "debtor":
      return I18n.t("features.payments.transactions.filters.tabs.debtor");
    case "payer":
      return I18n.t("features.payments.transactions.filters.tabs.payer");
  }
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
        onItemPress={handleFilterSelected}
        selectedIndex={selectedIndexOfCategory}
        tabAlignment="start"
      >
        {receiptsCategoryFilters.map((category, index) => {
          const label = getCategoryLabel(category);
          return (
            <TabItem
              accessibilityLabel={`${label}, ${I18n.t(
                "global.accessibility.progressTracker",
                {
                  index: index + 1,
                  total: receiptsCategoryFilters.length
                }
              )}`}
              key={category}
              label={label}
              testID={`CategoryTabTestID-${category}`}
            />
          );
        })}
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
