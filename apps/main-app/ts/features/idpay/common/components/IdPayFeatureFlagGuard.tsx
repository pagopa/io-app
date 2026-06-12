import { PropsWithChildren } from "react";
import { useIOSelector } from "../../../../store/hooks";
import { isIdPayEnabledSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { IdPayDisabledScreen } from "../screens/IdPayDisabledScreen";

/**
 * Component that wraps IDPay navigator components and checks if the
 * entire IDPay feature is enabled via the isIdPayEnabled feature flag.
 * If the feature is disabled, it shows the IdPayDisabledScreen instead of rendering
 * the children.
 */
export function IdPayFeatureFlagGuard({ children }: PropsWithChildren) {
  const isIdPayEnabled = useIOSelector(isIdPayEnabledSelector);

  if (!isIdPayEnabled) {
    return <IdPayDisabledScreen />;
  }

  return children;
}
