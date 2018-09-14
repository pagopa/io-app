import color from "color";
import { Icon } from "native-base";
import * as React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import * as Animatable from "react-native-animatable";
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
  fixedContainer: {
    overflow: "hidden",
    height: CONTAINER_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000
  },
  hidingContainer: {
    height: CONTAINER_HEIGHT,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  icon: {
    fontSize: 15
  },
  text: {
    fontSize: 15,
    marginLeft: 5
  }
});

/**
 * Implements a component that show a message when there is no network connection
 */
class ConnectionBar extends React.PureComponent<Props> {
  private translateY = new Animated.Value(-CONTAINER_HEIGHT);
  private animatedTranslateY = new Animated.Value(-CONTAINER_HEIGHT);
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
      <View style={styles.fixedContainer}>
        <Animated.View
          style={[
            styles.hidingContainer,
            {
              backgroundColor: this.props.isConnected
                ? color.rgb(53, 166, 63)
                : customVariables.brandLightGray
            },
            { transform: [{ translateY: this.animatedTranslateY }] }
          ]}
          useNativeDriver={true}
        >
          {this.props.isConnected ? (
            <Icon
              type="FontAwesome"
              name="check"
              style={[styles.icon, { color: customVariables.colorWhite }]}
            />
          ) : (
            <Animatable.View
              animation="rotate"
              easing="linear"
              iterationCount="infinite"
              useNativeDriver={true}
            >
              <Icon
                type="FontAwesome"
                name="spinner"
                style={[styles.icon, { color: customVariables.brandDarkGray }]}
              />
            </Animatable.View>
          )}
          <Text
            style={[
              styles.text,
              {
                color: this.props.isConnected
                  ? customVariables.colorWhite
                  : customVariables.brandDarkGray
              }
            ]}
          >
            {this.props.isConnected
              ? I18n.t("connection.status.online")
              : I18n.t("connection.status.offline")}
          </Text>
        </Animated.View>
      </View>
    );
  }
}

const mapStateToProps = (state: GlobalState): ReduxMappedProps => ({
  isConnected: state.network.isConnected
});

export default connect(mapStateToProps)(ConnectionBar);
