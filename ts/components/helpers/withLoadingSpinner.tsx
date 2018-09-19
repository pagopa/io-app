import hoistNonReactStatics from "hoist-non-react-statics";
import * as React from "react";
import Spinner, { SpinnerProps } from "react-native-loading-spinner-overlay";
import { connect } from "react-redux";

import { GlobalState } from "../../store/reducers/types";
import { Omit } from "../../types/utils";

type LoadingSpinnerInjectedProps = {
  isLoading: boolean;
};

/**
 * A HOC to display and overlay spinner conditionally
 *
 * @param WrappedComponent The react component you want to wrap
 * @param isLoadingSelector A redux selector that returns true when the spinner need to be visible
 * @param spinnerProps Props to pass to the spinner component
 */
export function withLoadingSpinner<P>(
  WrappedComponent: React.ComponentType<P>,
  isLoadingSelector: (s: GlobalState) => boolean,
  spinnerProps: Omit<SpinnerProps, "visible"> // TODO: Add default value
) {
  class WithLoadingSpinner extends React.Component<
    P & LoadingSpinnerInjectedProps
  > {
    public render() {
      const { isLoading, ...restProps } = this.props as any;
      return (
        <React.Fragment>
          <Spinner visible={isLoading} {...spinnerProps} />
          <WrappedComponent {...restProps} />
        </React.Fragment>
      );
    }
  }

  const mapStateToProps = (state: GlobalState) => ({
    isLoading: isLoadingSelector(state)
  });

  hoistNonReactStatics(WithLoadingSpinner, WrappedComponent);

  return connect(mapStateToProps)(WithLoadingSpinner);
}
