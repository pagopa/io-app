import hoistNonReactStatics from "hoist-non-react-statics";
import * as React from "react";
import Spinner, { SpinnerProps } from "react-native-loading-spinner-overlay";
import { Omit } from "../../types/utils";

/**
 * A HOC to display and overlay spinner conditionally
 *
 * @param WrappedComponent The react component you want to wrap
 * @param spinnerProps Props to pass to the spinner component
 */
export function withLoadingSpinner<P extends Readonly<{ isLoading: boolean }>>(
  WrappedComponent: React.ComponentType<P>,
  spinnerProps: Omit<SpinnerProps, "visible"> // TODO: Add default value
) {
  class WithLoadingSpinner extends React.Component<P> {
    public render() {
      const { isLoading } = this.props;
      return (
        <React.Fragment>
          <Spinner visible={isLoading} {...spinnerProps} />
          <WrappedComponent {...this.props} />
        </React.Fragment>
      );
    }
  }
  hoistNonReactStatics(WithLoadingSpinner, WrappedComponent);

  return WithLoadingSpinner;
}
