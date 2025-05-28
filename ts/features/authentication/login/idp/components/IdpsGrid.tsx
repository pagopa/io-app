/**
 * A component that show a Grid with every Identity Provider passed in the idps
 * array property. When an Identity Provider is selected a callback function is called.
 */

import {
  FlatList,
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
import { SpidIdp } from "../../../../../utils/idps";

type OwnProps = {
  contentContainerStyle?: StyleProp<ViewStyle>;
  footerComponent?: ComponentProps<typeof FlatList>["ListFooterComponent"];
  headerComponentStyle?: StyleProp<ViewStyle>;
  headerComponent?: ComponentProps<typeof FlatList>["ListHeaderComponent"];
  // Array of Identity Provider to show in the grid.
  idps: ReadonlyArray<SpidIdp>;
  // A callback function called when an Identity Provider is selected
  onIdpSelected: (_: SpidIdp) => void;
  testID?: string;
};

type Props = OwnProps;

const GRID_GUTTER: IOSpacingScale = 8;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

const keyExtractor = (idp: SpidIdp): string => idp.id;

const renderItem =
  (props: Props) =>
  (info: ListRenderItemInfo<SpidIdp>): ReactElement => {
    const { onIdpSelected } = props;
    const { item } = info;
    const { id, name, logo } = item;
    const { light, dark } = logo;

    const onPress = () => onIdpSelected(item);

    return (
      <ModuleIDP
        key={id}
        name={name}
        logo={{
          light,
          dark
        }}
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
