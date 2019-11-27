/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
 */

import React from "react";
import { Animated, Dimensions, Easing, StyleSheet } from "react-native";

export type LightModalContextInterface = Readonly<{
  component: React.ReactNode;
  showModal: (component: React.ReactNode) => void;
  hideModal: () => void;
}>;

export const LightModalContext = React.createContext<
  LightModalContextInterface
>({
  component: null,
  showModal: () => undefined,
  hideModal: () => undefined
});

type Props = {};

type State = LightModalContextInterface;

const animatedValue = new Animated.Value(0);
const screenWidth = Dimensions.get("screen").width;

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
  public showModal = (component: React.ReactNode) => {
    this.setState(
      {
        component
      },
      () =>
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.linear
        }).start()
    );
  };

  public hideModal = () =>
    this.setState({
      component: null
    });

  public state = {
    component: null,
    showModal: this.showModal,
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
  <LightModalConsumer>
    {({ component }) =>
      component ? (
        <Animated.View style={[styles.container, styledAnimation]}>
          {component}
        </Animated.View>
      ) : null
    }
  </LightModalConsumer>
);
