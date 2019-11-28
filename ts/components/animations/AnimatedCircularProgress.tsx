import { Millisecond } from "italia-ts-commons/lib/units";
import * as React from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import themeVariables from "../../theme/variables";

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    flexDirection: "column",
    overflow: "hidden",
    padding: -2
  }
});

interface Props {
  dimension: number;
  duration: Millisecond;
}

/**
 * Create a ring with this settings:
 * - 3/4 primary color
 * - 1/4 gray color
 * - infinite rotation in a clockwise direction
 */
export default class AnimatedCircularProgress extends React.Component<Props> {
  private animatedValue = new Animated.Value(0);

  public componentDidMount() {
    Animated.loop(
      Animated.timing(this.animatedValue, {
        toValue: 1,
        duration: this.props.duration,
        easing: Easing.linear,
        useNativeDriver: true
      })
    ).start();
  }

  public render() {
    return (
      <Animated.View
        style={[
          styles.ring,
          {
            width: this.props.dimension,
            height: this.props.dimension,
            borderRadius: this.props.dimension / 2
          },
          {
            transform: [
              {
                rotate: this.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"]
                })
              }
            ]
          }
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            backgroundColor: themeVariables.brandPrimary
          }}
        >
          <View
            style={{
              width: this.props.dimension / 2,
              height: this.props.dimension / 2,
              backgroundColor: themeVariables.brandPrimary
            }}
          />
          <View
            style={{
              width: this.props.dimension / 2,
              height: this.props.dimension / 2,
              backgroundColor: themeVariables.brandPrimary
            }}
          />
        </View>
        <View
          style={{
            flexDirection: "row",
            backgroundColor: themeVariables.brandPrimary
          }}
        >
          <View
            style={{
              width: this.props.dimension / 2,
              height: this.props.dimension / 2,
              backgroundColor: themeVariables.brandPrimary
            }}
          />
          <View
            style={{
              width: this.props.dimension / 2,
              height: this.props.dimension / 2,
              backgroundColor: themeVariables.brandLightGray
            }}
          />
        </View>
      </Animated.View>
    );
  }
}
