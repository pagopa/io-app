import { memo } from "react";
import { H2, VSpacer } from "@pagopa/io-app-design-system";
import { LayoutChangeEvent, View } from "react-native";
import I18n from "i18next";
import { ReceiptsCategoryFilter } from "../types";
import { ReceiptFilterTabs } from "./ReceiptFilterTabs";

type Props = {
  onLayout: (event: LayoutChangeEvent) => void;
  selectedCategory: ReceiptsCategoryFilter;
  onCategorySelected: (category: ReceiptsCategoryFilter) => void;
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
        selectedCategory={selectedCategory}
        onCategorySelected={onCategorySelected}
      />
    </View>
  ),
  (prevProps, nextProps) =>
    prevProps.selectedCategory === nextProps.selectedCategory
);
