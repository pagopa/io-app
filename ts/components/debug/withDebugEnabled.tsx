import { ComponentType } from "react";
import { useIOSelector } from "../../store/hooks";
import { isDebugModeEnabledSelector } from "../../store/reducers/debug";

/**
 * This HOC allows to render the wrapped component only if the debug mode is enabled, otherwise returns null (nothing)
 */
export const withDebugEnabled =
  <P extends Record<string, unknown>>(WrappedComponent: ComponentType<P>) =>
  (props: P) => {
    const isDebug = useIOSelector(isDebugModeEnabledSelector);
    if (!isDebug) {
      return null;
    }
    return <WrappedComponent {...props} />;
  };
