/**
 * A component that show a Grid with every Identity Provider passed in the idps
 * array property. When an Identity Provider is selected a callback function is called.
 */
import * as React from "react";
import { FlatList, Image, ListRenderItemInfo, StyleSheet } from "react-native";

import { Button } from "native-base";
import { connect } from "react-redux";
import variables from "../theme/variables";
import { GlobalState } from "../store/reducers/types";
import { idpsStateSelector } from "../store/reducers/content";
import { LocalIdpsFallback } from "../utils/idps";
import ButtonDefaultOpacity from "./ButtonDefaultOpacity";

type OwnProps = {
  // Array of Identity Provider to show in the grid.
  idps: ReadonlyArray<LocalIdpsFallback>;
  // A callback function called when an Identity Provider is selected
  onIdpSelected: (_: LocalIdpsFallback) => void;
  testID?: string;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

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

const keyExtractor = (idp: LocalIdpsFallback): string => idp.id;

const renderItem =
  (props: Props) =>
  (info: ListRenderItemInfo<LocalIdpsFallback>): React.ReactElement => {
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
        <Image
          source={item.localLogo ? item.localLogo : { uri: item.logo }}
          style={styles.idpLogo}
        />
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

const mapStateToProps = (state: GlobalState) => ({
  idpsState: idpsStateSelector(state)
});

export default connect(mapStateToProps)(IdpsGrid);
