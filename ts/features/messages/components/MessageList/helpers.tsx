import React from "react";
import { Animated, FlatList } from "react-native";

import ItemSeparatorComponent from "../../../../components/ItemSeparatorComponent";
import { ErrorLoadingComponent } from "./ErrorLoadingComponent";

export const ITEM_HEIGHT = 114;
const ITEM_HEIGHT_WITH_SEPARATOR = ITEM_HEIGHT + 1;

type ItemLayout = {
  length: number;
  offset: number;
  index: number;
};

/**
 * Calculate the ItemLayout of a given index.
 */
export const generateItemLayout =
  (totalItems: number) =>
  (index: number): ItemLayout => ({
    length: index === totalItems ? ITEM_HEIGHT : ITEM_HEIGHT_WITH_SEPARATOR,
    offset: ITEM_HEIGHT_WITH_SEPARATOR * index,
    index
  });

export const ItemSeparator = () => <ItemSeparatorComponent noPadded={true} />;

export const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

export type EmptyComponent = React.ComponentProps<
  typeof FlatList
>["ListEmptyComponent"];
type RenderEmptyListProps = {
  error?: string;
  EmptyComponent?: EmptyComponent;
};
export const renderEmptyList =
  ({ error, EmptyComponent }: RenderEmptyListProps) =>
  () => {
    if (error !== undefined) {
      return <ErrorLoadingComponent />;
    }
    if (EmptyComponent) {
      return <EmptyComponent />;
    }
    return null;
  };
