import * as React from "react";
import { H2, VSpacer } from "@pagopa/io-app-design-system";
import { LayoutChangeEvent, View } from "react-native";
import I18n from "../../../../i18n";
import { PaymentBizEventsCategoryFilter } from "../types";
import { PaymentsBizEventsFilterTabs } from "./PaymentsBizEventsFilterTabs";

type PaymentBizEventsSectionListHeaderProps = {
  onLayout: (event: LayoutChangeEvent) => void;
  selectedCategory: PaymentBizEventsCategoryFilter;
  onCategorySelected: (category: PaymentBizEventsCategoryFilter) => void;
};

export const PaymentBizEventsSectionListHeader = React.memo(
  ({
    onLayout,
    selectedCategory,
    onCategorySelected
  }: PaymentBizEventsSectionListHeaderProps) => (
    <View onLayout={onLayout}>
      <H2
        accessibilityLabel={I18n.t("features.payments.transactions.title")}
        accessibilityRole="header"
      >
        {I18n.t("features.payments.transactions.title")}
      </H2>
      <VSpacer size={16} />
      <PaymentsBizEventsFilterTabs
        selectedCategory={selectedCategory}
        onCategorySelected={onCategorySelected}
      />
    </View>
  ),
  (prevProps, nextProps) =>
    prevProps.selectedCategory === nextProps.selectedCategory
);
