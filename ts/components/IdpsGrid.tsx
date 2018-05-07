import { Button, View } from "native-base";
import * as React from "react";
import { Dimensions, Image, StyleSheet } from "react-native";

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
  gridContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
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
      <View style={styles.gridContainer}>
        {idps.map(idp => this.renderGridItem(idp))}
      </View>
    );
  }

  public keyExtractor = (idp: IdentityProvider): string => {
    return idp.id;
  };

  public renderGridItem = (idp: IdentityProvider): React.ReactElement<any> => {
    const { onIdpSelected } = this.props;
    const onPress = () => onIdpSelected(idp);
    return (
      <View key={idp.id} style={styles.gridItem}>
        <Button block={true} white={true} onPress={onPress}>
          <Image source={idp.logo} style={styles.idpLogo} />
        </Button>
      </View>
    );
  };
}

export default IdpsGrid;
