import { Millisecond } from "italia-ts-commons/lib/units";
import * as React from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import themeVariables from "../../theme/variables";

const styles = StyleSheet.create({
  ring: {
    position: "absolute",
    borderWidth: 2,
    borderColor: themeVariables.brandPrimary
  }
});

interface Props {
  dimension: number;
  duration: Millisecond;
  interval: Millisecond;
  opacity: number;
  boxDimension: number;
}
/**
 * Create a ring with opacity with the primary color
 */
export default class AnimatedRing extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  private animatedValue = new Animated.Value(0);

  public componentDidMount() {
    setTimeout(() => {
      Animated.loop(
        Animated.timing(this.animatedValue, {
          toValue: 1,
          duration: this.props.duration,
          easing: Easing.ease
        })
      ).start();
    }, this.props.interval);
  }

  public render() {
    return (
      <Animated.View
        style={[
          styles.ring,
          {
            width: this.props.dimension,
            height: this.props.dimension,
            borderRadius: this.props.dimension / 2,
            bottom: this.props.boxDimension / 2 - this.props.dimension / 2,
            opacity: this.props.opacity
          },
          {
            opacity: this.animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0]
            }),
            transform: [
              {
                scaleX: this.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.4]
                })
              },
              {
                scaleY: this.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.4]
                })
              }
            ]
          }
        ]}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}
