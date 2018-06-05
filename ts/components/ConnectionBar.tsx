import * as React from "react";
import { StyleSheet, Text, View } from "react-native";
import { connect } from "react-redux";
import I18n from "../i18n";
import { GlobalState } from "../reducers/types";
import { ReduxProps } from "../store/actions/types";
export type ReduxMappedProps = {
  isConnected: boolean;
};
export type OwnProps = {};
export type Props = ReduxMappedProps & ReduxProps & OwnProps;
const styles = StyleSheet.create({
  container: {
    display: "flex",
    justifyContent: "center",
    height: 30,
    paddingLeft: 20
  }
});
/**
 * Implements a component that show a message when there is no network connection
 */
class ConnectionBar extends React.PureComponent<Props, never> {
  public render() {
    const { isConnected } = this.props;
    if (isConnected) {
      return null;
    }
    return (
      <View style={styles.container}>
        <Text>{I18n.t("connection.status.offline")}</Text>
      </View>
    );
  }
}
const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isConnected: state.network.isConnected
});
export default connect(mapStateToProps)(ConnectionBar);
