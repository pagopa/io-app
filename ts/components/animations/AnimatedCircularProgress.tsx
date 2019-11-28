import { Millisecond } from "italia-ts-commons/lib/units";
import * as React from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import themeVariables from "../../theme/variables";

const styles = StyleSheet.create({
  ring: {
    flexDirection: "column"
  },
  ringContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    overflow: "hidden",
    position: "absolute",
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
    const RotateData = this.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["0deg", "360deg"]
    });
    return (
      <View
        style={[
          {
            width: this.props.dimension,
            height: this.props.dimension,
            borderRadius: this.props.dimension / 2
          },
          styles.ringContainer
        ]}
      >
        <Animated.View
          style={[
            styles.ring,
            {
              width: this.props.dimension,
              height: this.props.dimension,
              borderRadius: this.props.dimension / 2,
              backgroundColor: themeVariables.brandPrimary,
              flexDirection: "row",
              alignItems: "flex-start"
            },
            {
              transform: [
                {
                  rotate: RotateData
                }
              ]
            }
          ]}
        >
          <View
            style={{
              width: this.props.dimension / 2,
              height: this.props.dimension / 2,
              backgroundColor: themeVariables.brandLightGray
            }}
          />
        </Animated.View>
      </View>
    );
  }
}
