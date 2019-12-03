/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
 */

import React from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

export type LightModalContextInterface = Readonly<{
  component: React.ReactNode;
  showModal: (component: React.ReactNode) => void;
  showAnimatedModal: (component: React.ReactNode) => void;
  hideModal: () => void;
}>;

export const LightModalContext = React.createContext<
  LightModalContextInterface
>({
  component: null,
  showModal: () => undefined,
  showAnimatedModal: () => undefined,
  hideModal: () => undefined
});

type Props = {};

type State = LightModalContextInterface;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 1000
  }
});

const animatedValue = new Animated.Value(0);
const compositeAnimation = Animated.timing(animatedValue, {
  toValue: 1,
  duration: 250,
  useNativeDriver: true,
  easing: Easing.linear
});
const animationCallback = () => compositeAnimation.start();
const screenWidth = Dimensions.get("screen").width;
const styledAnimation = {
  transform: [
    {
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [screenWidth, 0]
      })
    }
  ]
};

export const LightModalConsumer = LightModalContext.Consumer;

export class LightModalProvider extends React.Component<Props, State> {
  public showAnimatedModal = (childComponent: React.ReactNode) => {
    const component = (
      <Animated.View style={[styles.container, styledAnimation]}>
        {childComponent}
      </Animated.View>
    );
    this.setState(
      {
        component
      },
      animationCallback
    );
  };

  public showModal = (childComponent: React.ReactNode) => {
    const component = <View style={[styles.container]}>{childComponent}</View>;
    this.setState({
      component
    });
  };

  public hideModal = () =>
    this.setState({
      component: null
    });

  public state = {
    component: null,
    showModal: this.showModal,
    showAnimatedModal: this.showAnimatedModal,
    hideModal: this.hideModal
  };

  public render() {
    return (
      <LightModalContext.Provider value={this.state}>
        {this.props.children}
      </LightModalContext.Provider>
    );
  }
}

export const LightModalRoot: React.SFC = () => (
  <LightModalConsumer>{({ component }) => component}</LightModalConsumer>
);
