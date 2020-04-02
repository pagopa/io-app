import { Option } from "fp-ts/lib/Option";
import React from "react";
import { FlatList, ListRenderItemInfo, RefreshControl } from "react-native";
import { ComponentProps } from "../types/react";
import ChooserListItem from "./ChooserListItem";
import ItemSeparatorComponent from "./ItemSeparatorComponent";
import { EdgeBorderComponent } from "./screens/EdgeBorderComponent";

type OwnProps<T> = {
  items: ReadonlyArray<T>;
  keyExtractor: (item: T) => string;
  itemTitleExtractor: (item: T) => string;
  isRefreshing: boolean;
  onRefresh?: () => void;
  selectedItemIds: Option<Set<string>>;
};

type ChooserListItemProps = "itemIconComponent" | "onPressItem";

type Props<T> = OwnProps<T> &
  Pick<ComponentProps<typeof ChooserListItem>, ChooserListItemProps>;

/**
 * A component to render a list with checkboxes to select one or more listed items
 */
class ChooserList<T> extends React.Component<Props<T>> {
  /**
   * Render item list
   */
  private renderItem = (info: ListRenderItemInfo<T>) => {
    const {
      itemTitleExtractor,
      keyExtractor,
      itemIconComponent,
      selectedItemIds,
      onPressItem
    } = this.props;
    const item = info.item;
    const itemId = keyExtractor(item);
    const isSelected = selectedItemIds.map(_ => _.has(itemId)).getOrElse(false);

    return (
      <ChooserListItem
        itemTitle={itemTitleExtractor(item)}
        itemId={itemId}
        isItemSelected={isSelected}
        itemIconComponent={itemIconComponent}
        onPressItem={onPressItem}
      />
    );
  };

  public render() {
    const {
      onRefresh,
      isRefreshing,
      items,
      keyExtractor,
      selectedItemIds
    } = this.props;

    const refreshControl = (
      <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
    );

    return (
      <FlatList
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={false}
        data={items}
        keyExtractor={keyExtractor}
        renderItem={this.renderItem}
        ItemSeparatorComponent={ItemSeparatorComponent}
        refreshControl={refreshControl}
        extraData={selectedItemIds}
        ListFooterComponent={items.length > 0 && <EdgeBorderComponent />}
      />
    );
  }
}

export default ChooserList;
