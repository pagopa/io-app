/**
 * A component that show a Grid with every Identity Provider passed in the idps
 * array property. When an Identity Provider is selected a callback function is called.
 */

import {
  IOSpacingScale,
  IOVisualCostants,
  ModuleIDP,
  VSpacer,
  VStack
} from "@io-app/design-system";
import I18n from "i18next";
import { ComponentProps, ReactElement } from "react";
import {
  FlatList,
  ListRenderItemInfo,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native";

import { SpidIdp } from "../../../../../utils/idps";

type IdpsGridProps = {
  contentContainerStyle?: StyleProp<ViewStyle>;
  emptyComponent?: ComponentProps<typeof FlatList>["ListEmptyComponent"];
  footerComponent?: ComponentProps<typeof FlatList>["ListFooterComponent"];
  headerComponent?: ComponentProps<typeof FlatList>["ListHeaderComponent"];
  headerComponentStyle?: StyleProp<ViewStyle>;
  // Array of Identity Provider to show in the grid.
  idps: ReadonlyArray<SpidIdp>;
  // A callback function called when an Identity Provider is selected
  onIdpSelected: (_: SpidIdp) => void;
  testID?: string;
};

const GRID_GUTTER: IOSpacingScale = 8;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

const renderItem =
  (props: IdpsGridProps) =>
  (info: ListRenderItemInfo<SpidIdp>): ReactElement => {
    const { onIdpSelected } = props;
    const { item } = info;
    const { id, name, logo } = item;
    const { light, dark } = logo;

    const onPress = () => onIdpSelected(item);

    return (
      <ModuleIDP
        key={id}
        logo={{
          light,
          dark
        }}
        name={name}
        onPress={onPress}
        testID={`idp-${item.id}-button`}
      />
    );
  };

const IdpsGrid = (props: IdpsGridProps) => (
  <FlatList
    contentContainerStyle={styles.contentContainer}
    data={props.idps}
    horizontal={false}
    ItemSeparatorComponent={() => <VSpacer size={GRID_GUTTER} />}
    ListEmptyComponent={props.emptyComponent}
    ListFooterComponent={props.footerComponent}
    ListHeaderComponent={props.headerComponent}
    ListHeaderComponentStyle={props.headerComponentStyle}
    numColumns={1}
    renderItem={renderItem(props)}
    testID={props.testID}
  />
);

export const IdpsGridSkeleton = () => (
  <VStack space={GRID_GUTTER}>
    {Array.from({ length: 5 }).map((_, i) => (
      <ModuleIDP
        isLoading
        key={`module-idp-item-${i}`}
        loadingAccessibilityLabel={I18n.t(
          "authentication.idp_selection.idps.loadingAccessibilityLabel"
        )}
      />
    ))}
  </VStack>
);

export default IdpsGrid;
