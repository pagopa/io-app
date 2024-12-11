import * as React from "react";
import { H2, VSpacer } from "@pagopa/io-app-design-system";
import { LayoutChangeEvent, View } from "react-native";
import I18n from "../../../../i18n";
import { NoticeEventsCategoryFilter } from "../types";
import { NoticeFilterTabs } from "./NoticeFilterTabs";

type NoticeSectionListHeaderProps = {
  onLayout: (event: LayoutChangeEvent) => void;
  selectedCategory: NoticeEventsCategoryFilter;
  onCategorySelected: (category: NoticeEventsCategoryFilter) => void;
};

export const NoticeSectionListHeader = React.memo(
  ({
    onLayout,
    selectedCategory,
    onCategorySelected
  }: NoticeSectionListHeaderProps) => (
    <View onLayout={onLayout}>
      <H2
        accessibilityLabel={I18n.t("features.payments.transactions.title")}
        accessibilityRole="header"
      >
        {I18n.t("features.payments.transactions.title")}
      </H2>
      <VSpacer size={16} />
      <NoticeFilterTabs
        selectedCategory={selectedCategory}
        onCategorySelected={onCategorySelected}
      />
    </View>
  ),
  (prevProps, nextProps) =>
    prevProps.selectedCategory === nextProps.selectedCategory
);
