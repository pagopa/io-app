/**
 * A component that show a Grid with every Identity Provider passed in the idps
 * array property. When an Identity Provider is selected a callback function is called.
 */

import {
  FlatList,
  ImageSourcePropType,
  ListRenderItemInfo,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native";

import {
  IOSpacingScale,
  IOVisualCostants,
  ModuleIDP,
  VSpacer
} from "@pagopa/io-app-design-system";
import { ComponentProps, FunctionComponent, ReactElement } from "react";
import { LocalIdpsFallback } from "../utils/idps";

type OwnProps = {
  contentContainerStyle?: StyleProp<ViewStyle>;
  footerComponent?: ComponentProps<typeof FlatList>["ListFooterComponent"];
  headerComponentStyle?: StyleProp<ViewStyle>;
  headerComponent?: ComponentProps<typeof FlatList>["ListHeaderComponent"];
  // Array of Identity Provider to show in the grid.
  idps: ReadonlyArray<LocalIdpsFallback>;
  // A callback function called when an Identity Provider is selected
  onIdpSelected: (_: LocalIdpsFallback) => void;
  testID?: string;
};

type Props = OwnProps;

const GRID_GUTTER: IOSpacingScale = 8;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

const keyExtractor = (idp: LocalIdpsFallback): string => idp.id;

const renderItem =
  (props: Props) =>
  (info: ListRenderItemInfo<LocalIdpsFallback>): ReactElement => {
    const { onIdpSelected } = props;
    const { item } = info;
    const { id, name, logo, localLogo } = item;

    const onPress = () => onIdpSelected(item);

    return (
      <ModuleIDP
        key={id}
        name={name}
        logo={{ uri: logo }}
        localLogo={localLogo as ImageSourcePropType}
        onPress={onPress}
        testID={`idp-${item.id}-button`}
      />
    );
  };

const IdpsGrid: FunctionComponent<Props> = (props: Props) => (
  <FlatList
    testID={props.testID}
    data={props.idps}
    numColumns={1}
    horizontal={false}
    keyExtractor={keyExtractor}
    renderItem={renderItem(props)}
    ItemSeparatorComponent={() => <VSpacer size={GRID_GUTTER} />}
    contentContainerStyle={styles.contentContainer}
    ListHeaderComponent={props.headerComponent}
    ListFooterComponent={props.footerComponent}
  />
);

export default IdpsGrid;
