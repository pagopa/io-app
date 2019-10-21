import * as React from "react";
import { Animated, Easing, StyleSheet } from "react-native";
import themeVariables from "../../theme/variables";
const imgDimension = 200;
const boxDimension = 230;

const styles = StyleSheet.create({
  description: {
    fontSize: 19,
    padding: 24,
    margin: 0
  },
  img: {
    width: imgDimension,
    height: imgDimension,
    borderRadius: imgDimension / 2,
    position: "absolute",
    bottom: boxDimension / 2 - imgDimension / 2,
    overflow: "hidden"
  },
  ring: {
    position: "absolute",
    borderWidth: 2,
    borderColor: themeVariables.brandPrimary
  },
  ringRow: {
    alignItems: "center",
    flexDirection: "row",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: themeVariables.brandPrimaryLight
  },
  ringCol: {
    alignItems: "center",
    flexDirection: "column",
    overflow: "visible",
    width: 1
  }
});

interface Props {
  dimension: number;
  duration: number;
  interval: number;
  opacity: number;
}
/**
 * With this animation we can represent 3 circles that light up similar to a 'radar' effect
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
            bottom: boxDimension / 2 - this.props.dimension / 2,
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
