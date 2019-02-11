/**
 * An HOC that uses the LightModalConsumer to inject LightModalContext
 * into the wrapped component.
 */

import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";

import {
  LightModalConsumer,
  LightModalContextInterface
} from "../ui/LightModal";

export function withLightModalContext<P>(
  WrappedComponent: React.ComponentType<P & LightModalContextInterface>
) {
  // tslint:disable-next-line:max-classes-per-file
  class WithLightModalContext extends React.Component<P> {
    public render() {
      return (
        <LightModalConsumer>
          {contextProps => (
            <WrappedComponent {...contextProps} {...this.props} />
          )}
        </LightModalConsumer>
      );
    }
  }

  hoistNonReactStatics(WithLightModalContext, WrappedComponent);

  return WithLightModalContext;
}
