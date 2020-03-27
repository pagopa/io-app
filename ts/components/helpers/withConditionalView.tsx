/**
 * A HOC to display the WrappedComponent when the check function is verified , otherwise the ConditionComponent will be displayed
 */

import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";

export function withConditionalView<P, T, C>(
  WrappedComponent: React.ComponentType<P>,
  check: (props: T) => boolean,
  ConditionComponent: React.ComponentType<C>
) {
  class ConditionalView extends React.PureComponent {
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
