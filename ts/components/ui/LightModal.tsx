/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
 */

import { View } from "native-base";
import React from "react";
import { StyleSheet } from "react-native";

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

export const LightModalConsumer = LightModalContext.Consumer;

export class LightModalProvider extends React.Component<Props, State> {
  public showModal = (component: React.ReactNode) => {
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
      component ? <View style={styles.container}>{component}</View> : null
    }
  </LightModalConsumer>
);
