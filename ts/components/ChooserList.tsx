import { View } from "native-base";
import React from "react";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet
} from "react-native";

import customVariables from "../theme/variables";

type OwnProps<T> = {
  items: ReadonlyArray<T>;
  keyExtractor: (item: T, index: number) => string;
  renderItem: ListRenderItem<T>;
  isRefreshing: boolean;
  onRefresh?: () => void;
};

type Props<T> = OwnProps<T>;

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
  public render() {
    const {
      onRefresh,
      isRefreshing,
      items,
      keyExtractor,
      renderItem
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
        renderItem={renderItem}
        ItemSeparatorComponent={ItemSeparatorComponent}
        refreshControl={refreshControl}
      />
    );
  }
}

export default ChooserList;
