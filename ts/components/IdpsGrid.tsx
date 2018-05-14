import * as React from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet
} from "react-native";

import { Button, View } from "native-base";

import { IdentityProvider } from "../models/IdentityProvider";

import variables from "../theme/variables";

export type OwnProps = {
  // Array of Identity Provider to show in the grid.
  idps: ReadonlyArray<IdentityProvider>;
  // A callback function called when an Identity Provider is selected
  onIdpSelected: (_: IdentityProvider) => void;
};

export type Props = OwnProps;

const { width: windowWidth } = Dimensions.get("window");

const GRID_GUTTER = variables.gridGutter;

/**
 * To create a space within items in the same row we use the bootstrap method of adding a negative margin
 * than a padding to each item.
 */
const styles = StyleSheet.create({
  gridContainer: {
    margin: -GRID_GUTTER
  },
  gridItem: {
    padding: GRID_GUTTER,
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
        style={styles.gridContainer}
        numColumns={2}
        data={idps}
        keyExtractor={this.keyExtractor}
        renderItem={this.renderItem}
      />
    );
  }

  public keyExtractor = (idp: IdentityProvider): string => {
    return idp.id;
  };

  /* eslint-disable flowtype/no-weak-types */
  public renderItem = (
    info: ListRenderItemInfo<IdentityProvider>
  ): React.ReactElement<any> => {
    const { onIdpSelected } = this.props;
    const idp = info.item;
    const onPress = () => onIdpSelected(idp);
    return (
      <View style={styles.gridItem}>
        <Button block={true} white={true} onPress={onPress}>
          <Image source={idp.logo} style={styles.idpLogo} />
        </Button>
      </View>
    );
  };
}

export default IdpsGrid;
