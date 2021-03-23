import { Text, View } from "native-base";
import * as React from "react";
import { Platform, StyleSheet } from "react-native";
import { connect } from "react-redux";

import { getStatusBarHeight, isIphoneX } from "react-native-iphone-x-helper";
import { ReduxProps } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import { getAppVersion } from "../utils/appVersion";
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
