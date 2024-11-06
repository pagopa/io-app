import {
  IOVisualCostants,
  TabItem,
  TabNavigation,
  VSpacer
} from "@pagopa/io-app-design-system";
import React from "react";
import { StyleSheet, View } from "react-native";
import {
  PaymentBizEventsCategoryFilter,
  paymentsBizEventsCategoryFilters
} from "../types";
import I18n from "../../../../i18n";

type PaymentsBizEventsFilterTabsProps = {
  selectedCategory: PaymentBizEventsCategoryFilter;
  onCategorySelected?: (category: PaymentBizEventsCategoryFilter) => void;
};

const PaymentsBizEventsFilterTabs = ({
  selectedCategory,
  onCategorySelected
}: PaymentsBizEventsFilterTabsProps) => {
  const selectedIndexOfCategory =
    paymentsBizEventsCategoryFilters.indexOf(selectedCategory);

  const handleFilterSelected = (index: number) => {
    const categoryByIndex = paymentsBizEventsCategoryFilters[index];
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
        {paymentsBizEventsCategoryFilters.map(category => (
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

export { PaymentsBizEventsFilterTabs };
