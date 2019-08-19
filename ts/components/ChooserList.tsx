import { Option } from "fp-ts/lib/Option";
import { View } from "native-base";
import React from "react";
import {
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet
} from "react-native";

import customVariables from "../theme/variables";
import { ComponentProps } from "../types/react";
import ChooserListItem from "./ChooserListItem";

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

const styles = StyleSheet.create({
  itemSeparator: {
    height: 1,
    marginLeft: customVariables.contentPadding,
    marginRight: customVariables.contentPadding,
    backgroundColor: customVariables.brandLightGray
  }
});

const ItemSeparatorComponent = () => <View style={styles.itemSeparator} />;

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
      />
    );
  }
}

export default ChooserList;
