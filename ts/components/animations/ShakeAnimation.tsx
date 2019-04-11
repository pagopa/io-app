import * as React from "react";
import { Animated, Easing } from "react-native";

type Props = Readonly<{
  duration: number;
}>;
/**
 *
 * This component create a custom animation called 'shake'
 */
export class ShakeAnimation extends React.PureComponent<Props> {
  private animatedValue: Animated.Value;

  constructor(props: Props) {
    super(props);
    this.animatedValue = new Animated.Value(0);
  }

  public shake = () => {
    this.animatedValue.setValue(0);
    // start animation
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: this.props.duration,
      useNativeDriver: true,
      easing: Easing.linear
    }).start();
  };

  public render() {
    // animation interpolate from left to right and the other way around
    const shaker = this.animatedValue.interpolate({
      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 0.9, 1],
      outputRange: [0, -10, 10, -10, 10, -10, 0]
    });
    return (
      <Animated.View
        style={{
          transform: [
            {
              translateX: shaker
            }
          ]
        }}
      >
        {this.props.children}
      </Animated.View>
    );
  }
}
