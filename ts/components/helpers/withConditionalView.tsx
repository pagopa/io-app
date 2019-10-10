/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
 */

import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";

export function withConditionalView<P, T, C>(
  WrappedComponent: React.ComponentType<P>,
  check: (props: T) => boolean,
  ConditionComponent: React.ComponentType<C>
) {
  class ConditionalView extends React.Component<T | P | C> {
    public render() {
      return check(this.props as T) ? (
        <WrappedComponent {...this.props as P} />
      ) : (
        <ConditionComponent {...this.props as C} />
      );
    }
  }

  hoistNonReactStatics(ConditionalView, WrappedComponent);
  hoistNonReactStatics(ConditionalView, ConditionComponent);

  return ConditionalView;
}
