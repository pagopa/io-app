import { Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";

import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import { connect } from "react-redux";
import { ReduxProps } from "../store/actions/types";
import { currentRouteSelector } from "../store/reducers/navigation";
import { GlobalState } from "../store/reducers/types";
import { getAppVersion } from "../utils/appVersion";

type Props = ReturnType<typeof mapStateToProps> & ReduxProps;

const styles = StyleSheet.create({
  versionContainer: {
    position: "absolute",
    top: Platform.select({
      ios:
        20 + (isIphoneX() || DeviceInfo.hasNotch() ? getStatusBarHeight() : 0),
      android: 0
    }),
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-start",
    alignItems: "center",
    zIndex: 1000
  },

  versionText: {
    padding: 2,
    backgroundColor: "#ffffffaa",
    fontSize: 16,
    lineHeight: 24,
    color: "#000000"
  },

  routeText: {
    padding: 2,
    backgroundColor: "#ffffffaa",
    fontSize: 14,
    lineHeight: 22,
    color: "#000000"
  }
});

const VersionInfoOverlay: React.FunctionComponent<Props> = (props: Props) => {
  const appVersion = getAppVersion();

  return (
    <View style={styles.versionContainer} pointerEvents="box-none">
      <Text style={styles.versionText}>{`app: ${appVersion}`}</Text>
      <Text style={styles.routeText}>{props.screenNameDebug}</Text>
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  serverInfo: state.backendInfo.serverInfo,
  // We need to use the currentRouteDebugSelector because this component is outside the NavigationContext and otherwise
  // doesn't receive the updates about the new screens
  screenNameDebug: currentRouteSelector(state)
});

export default connect(mapStateToProps)(VersionInfoOverlay);
