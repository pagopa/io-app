import hoistNonReactStatics from "hoist-non-react-statics";

import { Component, ComponentType } from "react";
import LoadingSpinnerOverlay from "../LoadingSpinnerOverlay";

/**
 * A HOC to display and overlay spinner conditionally
 *
 * @param WrappedComponent The react component you want to wrap
 * @param spinnerProps Props to pass to the spinner component
 */
export function withLoadingSpinner<
  P extends Readonly<{
    isLoading: boolean;
    loadingCaption?: string;
    loadingOpacity?: number;
    onCancel?: any;
  }>
>(WrappedComponent: ComponentType<P>) {
  class WithLoadingSpinner extends Component<P> {
    public render() {
      const { isLoading, loadingCaption, loadingOpacity, onCancel } =
        this.props;
      return (
        <LoadingSpinnerOverlay
          isLoading={isLoading}
          loadingCaption={loadingCaption}
          loadingOpacity={loadingOpacity}
          onCancel={onCancel}
        >
          <WrappedComponent {...this.props} />
        </LoadingSpinnerOverlay>
      );
    }
  }
  hoistNonReactStatics(WithLoadingSpinner, WrappedComponent);

  return WithLoadingSpinner;
}
