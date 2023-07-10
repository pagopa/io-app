/**
 * A component that show a Grid with every Identity Provider passed in the idps
 * array property. When an Identity Provider is selected a callback function is called.
 */
import * as React from "react";
import {
  FlatList,
  ImageSourcePropType,
  ListRenderItemInfo,
  StyleProp,
  StyleSheet,
  ViewStyle
} from "react-native";

import { connect } from "react-redux";
import { GlobalState } from "../store/reducers/types";
import { idpsStateSelector } from "../store/reducers/content";
import { LocalIdpsFallback } from "../utils/idps";
import { VSpacer } from "./core/spacer/Spacer";
import { IOVisualCostants } from "./core/variables/IOStyles";
import { ListItemIDP } from "./ui/ListItemIDP";
import { IOSpacingScale } from "./core/variables/IOSpacing";

type OwnProps = {
  contentContainerStyle?: StyleProp<ViewStyle>;
  footerComponent?: React.ReactNode;
  headerComponentStyle?: StyleProp<ViewStyle>;
  headerComponent?: React.ReactNode;
  // Array of Identity Provider to show in the grid.
  idps: ReadonlyArray<LocalIdpsFallback>;
  // A callback function called when an Identity Provider is selected
  onIdpSelected: (_: LocalIdpsFallback) => void;
  testID?: string;
};

type Props = OwnProps & ReturnType<typeof mapStateToProps>;

const GRID_GUTTER: IOSpacingScale = 8;

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: IOVisualCostants.appMarginDefault
  }
});

const keyExtractor = (idp: LocalIdpsFallback): string => idp.id;

const renderItem =
  (props: Props) =>
  (info: ListRenderItemInfo<LocalIdpsFallback>): React.ReactElement => {
    const { onIdpSelected } = props;
    const { item } = info;
    const { id, name, logo, localLogo } = item;

    const onPress = () => onIdpSelected(item);

    return (
      <ListItemIDP
        key={id}
        name={name}
        logo={logo as ImageSourcePropType}
        localLogo={localLogo as ImageSourcePropType}
        onPress={onPress}
        testID={`idp-${item.id}-button`}
      />
    );
  };

const IdpsGridRevamp: React.FunctionComponent<Props> = (props: Props) => (
  <FlatList
    bounces={false}
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

const mapStateToProps = (state: GlobalState) => ({
  idpsState: idpsStateSelector(state)
});

export default connect(mapStateToProps)(IdpsGridRevamp);
