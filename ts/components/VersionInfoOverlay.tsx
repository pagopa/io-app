import * as React from "react";

import DeviceInfo from "react-native-device-info";

import { Text, View } from "native-base";
import { StyleSheet } from "react-native";
import { connect } from "react-redux";

import { ServerInfo } from "../../definitions/backend/ServerInfo";
import { ReduxProps } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";

interface ReduxMappedProps {
  serverInfo: ServerInfo | undefined;
}

type Props = ReduxMappedProps & ReduxProps;

const styles = StyleSheet.create({
  versionContainer: {
    position: "absolute",
    top: 20,
    right: 3,
    zIndex: 1000
  },

  versionText: {
    fontSize: 12,
    lineHeight: 12,
    textAlign: "right",
    color: "#000000"
  }
});

const VersionInfoOverlay: React.SFC<Props> = props => {
  const appVersion = DeviceInfo.getVersion();
  const serverInfo = props.serverInfo;
  const serverVersion = serverInfo ? serverInfo.version : "?";
  return (
    <View style={styles.versionContainer}>
      <Text style={styles.versionText}>{appVersion}</Text>
      <Text style={styles.versionText}>{serverVersion}</Text>
    </View>
  );
};

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  serverInfo: state.backendInfo.serverInfo
});

export default connect(mapStateToProps)(VersionInfoOverlay);
