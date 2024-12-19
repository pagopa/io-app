/**
 * An HOC that uses the LightModalConsumer to inject LightModalContext
 * into the wrapped component.
 */

import hoistNonReactStatics from "hoist-non-react-statics";

import { Component, ComponentType } from "react";
import {
  LightModalConsumer,
  LightModalContextInterface
} from "../ui/LightModal";

export function withLightModalContext<P>(
  WrappedComponent: ComponentType<P & LightModalContextInterface>
) {
  class WithLightModalContext extends Component<P> {
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
