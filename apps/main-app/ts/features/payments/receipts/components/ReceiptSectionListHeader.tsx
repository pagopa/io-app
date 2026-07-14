import { H2, VSpacer } from "@io-app/design-system";
import I18n from "i18next";
import { memo } from "react";
import { LayoutChangeEvent, View } from "react-native";

import { ReceiptsCategoryFilter } from "../types";
import { ReceiptFilterTabs } from "./ReceiptFilterTabs";

type Props = {
  onCategorySelected: (category: ReceiptsCategoryFilter) => void;
  onLayout: (event: LayoutChangeEvent) => void;
  selectedCategory: ReceiptsCategoryFilter;
};

export const ReceiptSectionListHeader = memo(
  ({ onLayout, selectedCategory, onCategorySelected }: Props) => (
    <View onLayout={onLayout}>
      <H2
        accessibilityLabel={I18n.t("features.payments.transactions.title")}
        accessibilityRole="header"
      >
        {I18n.t("features.payments.transactions.title")}
      </H2>
      <VSpacer size={16} />
      <ReceiptFilterTabs
        onCategorySelected={onCategorySelected}
        selectedCategory={selectedCategory}
      />
    </View>
  ),
  (prevProps, nextProps) =>
    prevProps.selectedCategory === nextProps.selectedCategory
);
