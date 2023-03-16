/**
 * A component that show a Grid with every Identity Provider passed in the idps
 * array property. When an Identity Provider is selected a callback function is called.
 */
import * as React from "react";
import {
  FlatList,
  Image,
  ListRenderItemInfo,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";

import { connect } from "react-redux";
import themeVariables from "../theme/variables";
import { GlobalState } from "../store/reducers/types";
import { idpsStateSelector } from "../store/reducers/content";
import { LocalIdpsFallback } from "../utils/idps";
import { toAndroidCacheTimestamp } from "../utils/dates";
import { VSpacer } from "./core/spacer/Spacer";
import { IOColors } from "./core/variables/IOColors";

type OwnProps = {
  columnWrapperStyle?: StyleProp<ViewStyle>;
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

const GRID_GUTTER = 8;

/**
 * To create a space within items in the same row we use the bootstrap method of adding a negative margin
 * than a padding to each item.
 */
const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: IOColors.greyUltraLight
  },
  columnStyle: {
    paddingHorizontal: themeVariables.contentPadding,
    marginLeft: -GRID_GUTTER / 2,
    marginRight: -GRID_GUTTER / 2
  },
  gridItem: {
    alignSelf: "flex-start",
    width: "50%"
  },
  gridItemButton: {
    marginHorizontal: GRID_GUTTER / 2,
    backgroundColor: IOColors.white,
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: themeVariables.borderRadiusBase
  },
  idpLogo: {
    width: 120,
    height: 30,
    resizeMode: "contain"
  }
});

const keyExtractor = (idp: LocalIdpsFallback): string => idp.id;

// https://github.com/facebook/react-native/issues/12606
// Image cache forced refresh for Android by appending
// the `ts` query parameter as DDMMYYYY to simulate a 24h TTL.
const androidIdpLogoForcedRefreshed = () => {
  const timestampValue = toAndroidCacheTimestamp();
  return Platform.OS === "android" ? `?ts=${timestampValue}` : "";
};

const renderItem =
  (props: Props) =>
  (info: ListRenderItemInfo<LocalIdpsFallback>): React.ReactElement => {
    const { onIdpSelected } = props;
    const { item } = info;

    const onPress = () => onIdpSelected(item);

    return (
      <View style={styles.gridItem}>
        <Pressable
          key={item.id}
          accessible={true}
          accessibilityLabel={item.name}
          style={styles.gridItemButton}
          onPress={onPress}
          testID={`idp-${item.id}-button`}
        >
          <Image
            source={
              item.localLogo
                ? item.localLogo
                : {
                    uri: `${item.logo}${androidIdpLogoForcedRefreshed()}`
                  }
            }
            style={styles.idpLogo}
          />
        </Pressable>
      </View>
    );
  };

const IdpsGrid: React.FunctionComponent<Props> = (props: Props) => (
  <FlatList
    bounces={false}
    data={props.idps}
    numColumns={2}
    horizontal={false}
    keyExtractor={keyExtractor}
    renderItem={renderItem(props)}
    ItemSeparatorComponent={() => <VSpacer size={GRID_GUTTER} />}
    columnWrapperStyle={styles.columnStyle}
    contentContainerStyle={styles.contentContainer}
    ListHeaderComponent={props.headerComponent}
    ListFooterComponent={props.footerComponent}
  />
);

const mapStateToProps = (state: GlobalState) => ({
  idpsState: idpsStateSelector(state)
});

export default connect(mapStateToProps)(IdpsGrid);
