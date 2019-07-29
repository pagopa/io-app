import hoistNonReactStatics from "hoist-non-react-statics";
import { Omit } from "italia-ts-commons/lib/types";
import React from "react";

type State = {
  isLongPressEnabled: boolean;
};

export type InjectedWithServicesSelectionProps = {
  isLongPressEnabled: boolean;
  setLongPressEnabled: () => void;
  disableLongPress: () => void;
};

export function withServicesSelection<
  P extends InjectedWithServicesSelectionProps
>(WrappedComponent: React.ComponentType<P>) {
  class WithServicesSelection extends React.PureComponent<
    Omit<P, keyof InjectedWithServicesSelectionProps>,
    State
  > {
    constructor(props: Omit<P, keyof InjectedWithServicesSelectionProps>) {
      super(props);
      this.state = {
        isLongPressEnabled: false
      };
    }

    public render() {
      const { isLongPressEnabled } = this.state;
      return (
        <WrappedComponent
          {...this.props as P}
          isLongPressEnabled={isLongPressEnabled}
          setLongPressEnabled={this.setLongPressEnabled}
          disableLongPress={this.disableLongPress}
        />
      );
    }

    private setLongPressEnabled = () => {
      this.setState({
        isLongPressEnabled: true
      });
    };
    private disableLongPress = () => {
      this.setState({
        isLongPressEnabled: false
      });
    };
  }

  hoistNonReactStatics(WithServicesSelection, WrappedComponent);

  return WithServicesSelection;
}
