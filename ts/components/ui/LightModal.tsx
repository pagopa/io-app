/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
 */

import React from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";

export type LightModalContextInterface = Readonly<{
  component: React.ReactNode;
  showModal: (component: React.ReactNode) => void;
  showModalFadeInAnimation: (component: React.ReactNode) => void;
  showAnimatedModal: (
    component: React.ReactNode,
    animatedValue?: AnimationLightModal
  ) => void;
  hideModal: () => void;
  onHiddenModal: () => void;
  setOnHiddenModal: (callback: () => void) => void;
}>;

export const LightModalContext = React.createContext<
  LightModalContextInterface
>({
  component: null,
  showModal: () => undefined,
  showModalFadeInAnimation: () => undefined,
  showAnimatedModal: () => undefined,
  hideModal: () => undefined,
  onHiddenModal: () => undefined,
  setOnHiddenModal: () => undefined
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
const screenHeight = Dimensions.get("screen").height;
export const RightLeftAnimation = {
  transform: [
    {
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [screenWidth, 0]
      })
    }
  ]
};

export const LeftRightAnimation = {
  transform: [
    {
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-screenWidth, 0]
      })
    }
  ]
};

export const BottomTopAnimation = {
  transform: [
    {
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [screenHeight, 0]
      })
    }
  ]
};

export const TopBottomAnimation = {
  transform: [
    {
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-screenHeight, 0]
      })
    }
  ]
};

export const ScaleAnimation = {
  transform: [
    {
      scale: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1]
      })
    }
  ]
};

const fadeAnim = new Animated.Value(0);
const FadeInAnimation = Animated.timing(fadeAnim, {
  toValue: 1,
  duration: 250
});

export type AnimationLightModal =
  | typeof ScaleAnimation
  | typeof TopBottomAnimation
  | typeof BottomTopAnimation
  | typeof LeftRightAnimation
  | typeof RightLeftAnimation;

export const LightModalConsumer = LightModalContext.Consumer;

export class LightModalProvider extends React.Component<Props, State> {
  public showAnimatedModal = (
    childComponent: React.ReactNode,
    styledAnimation: AnimationLightModal = RightLeftAnimation
  ) => {
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

  public showModalFadeInAnimation = (childComponent: React.ReactNode) => {
    const component = (
      <Animated.View style={styles.container} opacity={fadeAnim}>
        {childComponent}
      </Animated.View>
    );
    this.setState(
      {
        component
      },
      () => {
        FadeInAnimation.start();
      }
    );
  };

  public showModal = (childComponent: React.ReactNode) => {
    const component = <View style={[styles.container]}>{childComponent}</View>;
    this.setState({
      component
    });
  };

  public hideModal = () => {
    fadeAnim.setValue(0);
    FadeInAnimation.stop();
    this.setState(
      {
        component: null
      },
      () => {
        this.state.onHiddenModal();
      }
    );
  };

  public setOnHiddenModal = (onHiddenModal: () => void) => {
    this.setState({ onHiddenModal });
  };

  public state = {
    component: null,
    showModal: this.showModal,
    showAnimatedModal: this.showAnimatedModal,
    showModalFadeInAnimation: this.showModalFadeInAnimation,
    hideModal: this.hideModal,
    onHiddenModal: () => undefined,
    setOnHiddenModal: this.setOnHiddenModal
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
