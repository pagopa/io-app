import * as React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { connect } from "react-redux";

import I18n from "../i18n";
import { ReduxProps } from "../store/actions/types";
import { GlobalState } from "../store/reducers/types";
import customVariables from "../theme/variables";

type ReduxMappedProps = {
  isConnected: boolean;
};

type Props = ReduxMappedProps & ReduxProps;

const CONTAINER_HEIGHT = 30;

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    height: CONTAINER_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000
  },
  animated: {
    height: CONTAINER_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: customVariables.brandLightGray,
    justifyContent: "center",
    alignItems: "center"
  }
});

/**
 * Implements a component that show a message when there is no network connection
 */
class ConnectionBar extends React.PureComponent<Props> {
  private translateY = new Animated.Value(-CONTAINER_HEIGHT);
  private animatedTranslateY = new Animated.Value(0);
  private translateYAnimation = Animated.timing(this.animatedTranslateY, {
    toValue: this.translateY,
    useNativeDriver: true
  });

  public componentDidMount() {
    this.translateYAnimation.start();
  }

  public componentWillUnmount() {
    this.translateYAnimation.stop();
  }

  public render() {
    this.translateY.setValue(this.props.isConnected ? -CONTAINER_HEIGHT : 0);

    return (
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.animated,
            { transform: [{ translateY: this.animatedTranslateY }] }
          ]}
          useNativeDriver={true}
        >
          <Text>{I18n.t("connection.status.offline")}</Text>
        </Animated.View>
      </View>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isConnected: state.network.isConnected
});

export default connect(mapStateToProps)(ConnectionBar);
