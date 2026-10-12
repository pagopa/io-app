import { PropsWithChildren } from "react";

import { useIOSelector } from "../../../../store/hooks";
import {
  isIdPayDetailsEnabledSelector,
  isIdPayOnboardingEnabledSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
import { IdPayDisabledSubFeatureAlert } from "./IdPayDisabledSubFeatureAlert";

export type IdPayFeatureKey = "idpay.initiative_details" | "idpay.onboarding";

const featureFlagSelectorMap: Record<
  IdPayFeatureKey,
  (state: GlobalState) => boolean
> = {
  "idpay.onboarding": isIdPayOnboardingEnabledSelector,
  "idpay.initiative_details": isIdPayDetailsEnabledSelector
};

type IdPayEnabledSubFeatureGuardProps = {
  featureKey: IdPayFeatureKey;
};

/**
 * Component wrapper that checks if the sub-feature is enabled and shows the
 * disabled sub-feature alert if not.
 *
 * @param children - The children to render
 * @param featureKey - The key of the feature to check
 * @returns The children or the disabled sub-feature alert
 */
export function IdPayEnabledSubFeatureGuard({
  children,
  featureKey
}: PropsWithChildren<IdPayEnabledSubFeatureGuardProps>) {
  const isEnabled = useIOSelector(featureFlagSelectorMap[featureKey]);
  if (!isEnabled) {
    return <IdPayDisabledSubFeatureAlert featureKey={featureKey} />;
  }
  return children;
}
