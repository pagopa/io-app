import color from "color";
import * as React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { connect } from "react-redux";

import I18n from "../i18n";
import { ReduxProps } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import customVariables from "../theme/variables";
import IconFont from "./ui/IconFont";

type Props = ReturnType<typeof mapStateToProps> & ReduxProps;

const styles = StyleSheet.create({
  container: {
    zIndex: Platform.OS === "ios" ? 1 : undefined
  },
  inner: {
    backgroundColor: color(customVariables.brandDarkestGray)
      .fade(0.5)
      .string(),
    height: 30,
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    top: Platform.OS === "ios" ? 12 : 0,
    width: "100%",
    zIndex: Platform.OS === "android" ? 1 : undefined
  },
  icon: {
    color: customVariables.colorWhite,
    marginRight: customVariables.fontSizeBase / 2
  },
  text: {
    textAlign: "center",
    color: customVariables.colorWhite,
    fontWeight: "bold"
  }
});

/**
 * Implements a component that show a message when there is no network connection
 */
const ConnectionBar: React.SFC<Props> = props => {
  if (props.isConnected) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <IconFont name="io-offline" style={styles.icon} />
        <Text style={styles.text}>{I18n.t("connection.status.offline")}</Text>
      </View>
    </View>
  );
};

const mapStateToProps = (state: GlobalState) => ({
  isConnected: state.network.isConnected
});

export default connect(mapStateToProps)(ConnectionBar);
