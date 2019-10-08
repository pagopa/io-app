/**
 * Provides a mechanism to display non-native modals (i.e. overlays)
 * on top of the root component.
 */

import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";

export type PrivateSelectorViewInterface = Readonly<{
  component: React.ReactNode;
}>;

// tslint:disable-next-line: no-commented-code
// type Props = PrivateSelectorViewInterface;

export function withConditionalView<P extends T, T>(
  WrappedComponent: React.ComponentType<P>,
  check: (props: P) => boolean,
  ConditionComponent: React.ComponentType<T>
) {
  class ConditionalView extends React.Component<P> {
    public render() {
      return check(this.props) ? (
        <WrappedComponent {...this.props} />
      ) : (
        <ConditionComponent {...this.props} />
      );
    }
  }

  hoistNonReactStatics(ConditionalView, WrappedComponent);
  hoistNonReactStatics(ConditionalView, ConditionComponent);

  return ConditionalView;
}
