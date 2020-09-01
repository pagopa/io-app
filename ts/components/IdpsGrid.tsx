/**
 * A component that show a Grid with every Identity Provider passed in the idps
 * array property. When an Identity Provider is selected a callback function is called.
 */
import * as React from "react";
import { FlatList, Image, ListRenderItemInfo, StyleSheet } from "react-native";

import { Button } from "native-base";
import { IdentityProvider } from "../models/IdentityProvider";
import variables from "../theme/variables";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";

type OwnProps = {
  // Array of Identity Provider to show in the grid.
  idps: ReadonlyArray<IdentityProvider>;
  // A callback function called when an Identity Provider is selected
  onIdpSelected: (_: IdentityProvider) => void;
  testID?: string;
};

type Props = OwnProps;

const GRID_GUTTER = variables.gridGutter;

/**
 * To create a space within items in the same row we use the bootstrap method of adding a negative margin
 * than a padding to each item.
 */
const styles = StyleSheet.create({
  gridItem: {
    margin: GRID_GUTTER / 2,
    padding: 30,
    flex: 1
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
): React.ReactElement => {
  const { onIdpSelected } = props;
  const { item } = info;
  const onPress = () => onIdpSelected(item);
  if (item.isTestIdp === true) {
    return (
      // render transparent button if idp is testIdp (see https://www.pivotaltracker.com/story/show/172082895)
      <Button
        transparent={true}
        onPress={onPress}
        style={styles.gridItem}
        accessible={false} // ignore cause it serves only for debug mode (stores reviewers)
      />
    );
  }
  return (
    <ButtonDefaultOpacity
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
    </ButtonDefaultOpacity>
  );
};

const IdpsGrid: React.FunctionComponent<Props> = (props: Props) => (
    <FlatList
      bounces={false}
      data={props.idps}
      numColumns={2}
      keyExtractor={keyExtractor}
      renderItem={renderItem(props)}
    />
  );

export default IdpsGrid;
