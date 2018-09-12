import { Button, View } from "native-base";
import * as React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet
} from "react-native";

import { IdentityProvider } from "../models/IdentityProvider";
import variables from "../theme/variables";

export type OwnProps = {
  // Array of Identity Provider to show in the grid.
  idps: ReadonlyArray<IdentityProvider>;
  // A callback function called when an Identity Provider is selected
  onIdpSelected: (_: IdentityProvider) => void;
  testID?: string;
};

export type Props = OwnProps;

const { width: windowWidth } = Dimensions.get("window");

const GRID_GUTTER = variables.gridGutter;

/**
 * To create a space within items in the same row we use the bootstrap method of adding a negative margin
 * than a padding to each item.
 */
const styles = StyleSheet.create({
  gridItem: {
    padding: GRID_GUTTER / 2,
    // Calculate the real width of each item

    width: (windowWidth - (2 * variables.contentPadding - 2 * GRID_GUTTER)) / 2
  },
  idpLogo: {
    width: 120,
    height: 30,
    resizeMode: "contain"
  }
});

/**
 * A component that show a Grid with every Identity Provider passed in the idps
 * array property. When an Identity Provider is selected a callback function is called.
 */
class IdpsGrid extends React.Component<Props> {
  public render() {
    const { idps } = this.props;
    return (
      <FlatList
        data={idps}
        numColumns={2}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
      />
    );
  }

  private keyExtractor = (idp: IdentityProvider): string => {
    return idp.id;
  };

  private renderItem = (
    info: ListRenderItemInfo<IdentityProvider>
  ): React.ReactElement<any> => {
    const { onIdpSelected } = this.props;
    const { item } = info;
    const onPress = () => onIdpSelected(item);
    return (
      <View key={item.id} style={styles.gridItem}>
        <Button
          transparent={true}
          block={true}
          white={true}
          onPress={onPress}
          testID={`idp-${item.id}-button`}
        >
          <Image source={item.logo} style={styles.idpLogo} />
        </Button>
      </View>
    );
  };
}

export default IdpsGrid;
