import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";
import { NavigationInjectedProps } from "react-navigation";

/**
 * A HOC to display the WrappedComponent when the check function is verified,
 * otherwise the ConditionComponent will be displayed
 */
export function withConditionalView<P, T, C>(
  WrappedComponent: React.ComponentType<P>,
  check: (props: T) => boolean,
  ConditionComponent: React.ComponentType<C>
) {
  /**
   * The component should inherit the navigation params of both the wrapped and
   * the contition component to ensure the nagivigation can address the proper
   * navigation paramaters
   */
  type nullN = {};
  type NP = P extends NavigationInjectedProps<infer N> ? N : nullN;
  type NC = C extends NavigationInjectedProps<infer N> ? N : nullN;
  type NN = NavigationInjectedProps<NP & NC>;

  class ConditionalView extends React.PureComponent<(P | C) & T & NN> {
    public render() {
      return check(this.props as T) ? (
        <WrappedComponent {...this.props as P & NN} />
      ) : (
        <ConditionComponent {...this.props as C & NN} />
      );
    }
  }

  hoistNonReactStatics(ConditionalView, WrappedComponent);
  hoistNonReactStatics(ConditionalView, ConditionComponent);

  return ConditionalView;
}
