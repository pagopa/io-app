/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
 */

import { Component, createContext, PropsWithChildren, ReactNode } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  View
} from "react-native";
import { isScreenReaderEnabled } from "../../utils/accessibility";
export type LightModalContextInterface = Readonly<{
  component: ReactNode;
  showModal: (component: ReactNode) => void;
  showModalFadeInAnimation: (component: ReactNode) => void;
  showAnimatedModal: (
    component: ReactNode,
    animatedValue?: AnimationLightModal
  ) => void;
  hideModal: () => void;
  onHiddenModal: () => void;
  setOnHiddenModal: (callback: () => void) => void;
}>;

export const LightModalContext = createContext<LightModalContextInterface>({
  component: null,
  showModal: () => undefined,
  showModalFadeInAnimation: () => undefined,
  showAnimatedModal: () => undefined,
  hideModal: () => undefined,
  onHiddenModal: () => undefined,
  setOnHiddenModal: () => undefined
});

type Props = Record<string, unknown>;

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
  useNativeDriver: false,
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

export class LightModalProvider extends Component<
  PropsWithChildren<Props>,
  State
> {
  public showAnimatedModal = async (
    childComponent: ReactNode,
    styledAnimation: AnimationLightModal = RightLeftAnimation
  ) => {
    const isScreenReaderActive = await isScreenReaderEnabled();
    const component = (
      <Animated.View style={[styles.container, styledAnimation]}>
        {isScreenReaderActive ? (
          <Modal>{childComponent}</Modal>
        ) : (
          childComponent
        )}
      </Animated.View>
    );
    this.setState(
      {
        component
      },
      animationCallback
    );
  };

  public showModalFadeInAnimation = async (childComponent: ReactNode) => {
    const isScreenReaderActive = await isScreenReaderEnabled();
    const component = (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        {isScreenReaderActive ? (
          <Modal>{childComponent}</Modal>
        ) : (
          childComponent
        )}
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

  public showModal = async (childComponent: ReactNode) => {
    const isScreenReaderActive = await isScreenReaderEnabled();
    const component = (
      <View style={styles.container}>
        {isScreenReaderActive ? (
          <Modal>{childComponent}</Modal>
        ) : (
          childComponent
        )}
      </View>
    );
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

export const LightModalRoot = () => (
  <LightModalConsumer>{({ component }) => component}</LightModalConsumer>
);
