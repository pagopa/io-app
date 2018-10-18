import color from "color";
import * as React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { connect } from "react-redux";

import I18n from "../i18n";
import { ReduxProps } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import customVariables from "../theme/variables";

type ReduxMappedProps = {
  isConnected: boolean;
};

type Props = ReduxMappedProps & ReduxProps;

const styles = StyleSheet.create({
  container: {
    zIndex: 1
  },
  inner: {
    backgroundColor: color(customVariables.brandDarkGray)
      .darken(0.1)
      .fade(0.2)
      .string(),
    height: 30,
    position: "absolute",
    justifyContent: "center",
    top: Platform.OS === "ios" ? 12 : 0,
    width: "100%"
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
        <Text style={styles.text}>{I18n.t("connection.status.offline")}</Text>
      </View>
    </View>
  );
};

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isConnected: state.network.isConnected
});

export default connect(mapStateToProps)(ConnectionBar);
