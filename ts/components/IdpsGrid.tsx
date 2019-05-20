import { Button } from "native-base";
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

type OwnProps = {
  // Array of Identity Provider to show in the grid.
  idps: ReadonlyArray<IdentityProvider>;
  // A callback function called when an Identity Provider is selected
  onIdpSelected: (_: IdentityProvider) => void;
  testID?: string;
};

type Props = OwnProps;

const { width: windowWidth } = Dimensions.get("window");

const GRID_GUTTER = variables.gridGutter;

/**
 * To create a space within items in the same row we use the bootstrap method of adding a negative margin
 * than a padding to each item.
 */
const styles = StyleSheet.create({
  gridItem: {
    margin: GRID_GUTTER / 2,
    // Calculate the real width of each item

    width: (windowWidth - (2 * variables.contentPadding + 2 * GRID_GUTTER)) / 2
  },
  idpLogo: {
    width: 120,
    height: 30,
    resizeMode: "contain"
  }
});

const keyExtractor = (idp: IdentityProvider): string => idp.id;

const renderItem = (props: Props) => (
  info: ListRenderItemInfo<IdentityProvider>
): React.ReactElement<any> => {
  const { onIdpSelected } = props;
  const { item } = info;
  const onPress = () => onIdpSelected(item);
  return (
    <Button
      key={item.id}
      accessible={true}
      accessibilityLabel={item.name}
      style={styles.gridItem}
      transparent={true}
      block={true}
      white={true}
      onPress={onPress}
      testID={`idp-${item.id}-button`}
    >
      <Image source={item.logo} style={styles.idpLogo} />
    </Button>
  );
};

/**
 * A component that show a Grid with every Identity Provider passed in the idps
 * array property. When an Identity Provider is selected a callback function is called.
 */
const IdpsGrid: React.SFC<Props> = props => (
  <FlatList
    data={props.idps}
    numColumns={2}
    keyExtractor={keyExtractor}
    renderItem={renderItem(props)}
  />
);

export default IdpsGrid;
