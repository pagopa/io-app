/**
 * An HOC that uses the LightModalConsumer to inject LightModalContext
 * into the wrapped component.
 */

import hoistNonReactStatics from "hoist-non-react-statics";
import React from "react";
import {
  BottomSheetConsumer,
  BottomSheetContextInterface
} from "../ui/BottomSheet";

export function withBottomSheetContext<P>(
  WrappedComponent: React.ComponentType<P & BottomSheetContextInterface>
) {
  const WithBottomSheetContext: React.FunctionComponent<P> = props => (
    <BottomSheetConsumer>
      {contextProps => <WrappedComponent {...contextProps} {...props} />}
    </BottomSheetConsumer>
  );

  hoistNonReactStatics(WithBottomSheetContext, WrappedComponent);

  return WithBottomSheetContext;
}
