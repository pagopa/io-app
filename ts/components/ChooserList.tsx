import { View } from "native-base";
import React from "react";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet
} from "react-native";

import customVariables from "../theme/variables";

type OwnProps = {
  items: ReadonlyArray<any>;
  keyExtractor: (item: any, index: number) => string;
  renderItem: ListRenderItem<any>;
  refreshing?: boolean;
  onRefresh?: () => void;
};

type Props = OwnProps;

const styles = StyleSheet.create({
  itemSeparator: {
    height: 1,
    marginLeft: customVariables.contentPadding,
    marginRight: customVariables.contentPadding,
    backgroundColor: customVariables.brandLightGray
  }
});

const ItemSeparatorComponent = () => <View style={styles.itemSeparator} />;

class ChooserList extends React.Component<Props> {
  public render() {
    const {
      onRefresh,
      refreshing,
      items,
      keyExtractor,
      renderItem
    } = this.props;

    const refreshControl =
      onRefresh && refreshing !== undefined ? (
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      ) : (
        undefined
      );

    return (
      <React.Fragment>
        <FlatList
          keyboardShouldPersistTaps="always"
          removeClippedSubviews={false}
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ItemSeparatorComponent={ItemSeparatorComponent}
          refreshControl={refreshControl}
        />
      </React.Fragment>
    );
  }
}

export default ChooserList;
