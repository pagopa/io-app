import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";

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
   * the condition component to ensure the navigation can address the proper
   * navigation parameters
   */
  type nullN = Record<string, unknown>;
  type NP = P extends IOStackNavigationRouteProps<infer N> ? N : nullN;
  type NC = C extends IOStackNavigationRouteProps<infer N> ? N : nullN;
  type NN = IOStackNavigationRouteProps<NP & NC>;

  class ConditionalView extends React.PureComponent<(P | C) & T & NN> {
    public render() {
      return check(this.props as T) ? (
        <WrappedComponent {...(this.props as P & NN)} />
      ) : (
        <ConditionComponent {...(this.props as C & NN)} />
      );
    }
  }

  hoistNonReactStatics(ConditionalView, WrappedComponent);
  hoistNonReactStatics(ConditionalView, ConditionComponent);

  return ConditionalView;
}
