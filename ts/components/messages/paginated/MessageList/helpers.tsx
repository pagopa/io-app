import React from "react";
import { Animated, FlatList, ListRenderItemInfo } from "react-native";

import { UIMessage } from "../../../../store/reducers/entities/messages/types";
import ItemSeparatorComponent from "../../../ItemSeparatorComponent";
import MessageListItem from "./Item";

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

type RenderItemProps = {
  isRead: boolean;
  onLongPress: (id: string) => void;
  onPress: (id: string) => void;
  selectedMessageIds?: ReadonlySet<string>;
};
export const renderItem =
  ({ isRead, onLongPress, onPress, selectedMessageIds }: RenderItemProps) =>
  ({ item: message }: ListRenderItemInfo<UIMessage>) =>
    (
      <MessageListItem
        isRead={isRead}
        message={message}
        onPress={onPress}
        onLongPress={onLongPress}
        isSelectionModeEnabled={!!selectedMessageIds}
        isSelected={!!selectedMessageIds?.has(message.id)}
      />
    );
