import hoistNonReactStatics from "hoist-non-react-statics";
import * as React from "react";
import { Overlay } from "../ui/Overlay";
import { RefreshIndicator } from "../ui/RefreshIndicator";

/**
 * A HOC to display and overlay spinner conditionally
 *
 * @param WrappedComponent The react component you want to wrap
 * @param spinnerProps Props to pass to the spinner component
 */
export function withLoadingSpinner<P extends Readonly<{ isLoading: boolean }>>(
  WrappedComponent: React.ComponentType<P>
) {
  class WithLoadingSpinner extends React.Component<P> {
    public render() {
      const { isLoading } = this.props;
      return (
        <Overlay foreground={isLoading ? <RefreshIndicator /> : undefined}>
          <WrappedComponent {...this.props} />
        </Overlay>
      );
    }
  }
  hoistNonReactStatics(WithLoadingSpinner, WrappedComponent);

  return WithLoadingSpinner;
}
