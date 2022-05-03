import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";
import { StyleSheet, View } from "react-native";
import { IOStackNavigationRouteProps } from "../../navigation/params/AppParamsList";
import { IOColors } from "../core/variables/IOColors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: IOColors.white
  }
});

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
  type nullN = Record<string, object | undefined>;
  type NP = P extends IOStackNavigationRouteProps<infer N> ? N : nullN;
  type NC = C extends IOStackNavigationRouteProps<infer N> ? N : nullN;
  type NN = IOStackNavigationRouteProps<NP & NC>;

  class ConditionalView extends React.PureComponent<(P | C) & T & NN> {
    public render() {
      return (
        <View style={styles.container}>
          {check(this.props as T) ? (
            <WrappedComponent {...(this.props as P & NN)} />
          ) : (
            <ConditionComponent {...(this.props as C & NN)} />
          )}
        </View>
      );
    }
  }

  hoistNonReactStatics(ConditionalView, WrappedComponent);
  hoistNonReactStatics(ConditionalView, ConditionComponent);

  return ConditionalView;
}
