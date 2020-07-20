import { Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import DeviceInfo from "react-native-device-info";
import { connect } from "react-redux";

import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import { ReduxProps } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import { getCurrentRouteName } from "../utils/navigation";

type Props = ReturnType<typeof mapStateToProps> & ReduxProps;

const styles = StyleSheet.create({
  versionContainer: {
    position: "absolute",
    top: Platform.select({
      ios: 20 + (isIphoneX() ? getStatusBarHeight() : 0),
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
    fontSize: 16,
    lineHeight: 14,
    color: "#000000"
  },

  routeText: {
    fontSize: 14,
    lineHeight: 12,
    color: "#000000"
  }
});

const VersionInfoOverlay: React.SFC<Props> = props => {
  const appVersion = DeviceInfo.getVersion();
  const serverInfo = props.serverInfo;
  const serverVersion = serverInfo ? serverInfo.version : "?";
  return (
    <View style={styles.versionContainer} pointerEvents="box-none">
      <Text style={styles.versionText}>
        {`app: ${appVersion}`} - {`backend: ${serverVersion}`}
      </Text>
      <Text style={styles.routeText}>{getCurrentRouteName(props.nav)}</Text>
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  nav: state.nav,
  serverInfo: state.backendInfo.serverInfo
});

export default connect(mapStateToProps)(VersionInfoOverlay);
