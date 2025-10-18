import { PropsWithChildren } from "react";
import {
  isIdPayDetailsEnabledSelector,
  isIdPayOnboardingEnabledSelector
} from "../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../store/reducers/types";
import { useIOSelector } from "../../../../store/hooks";
import { IdPayDisabledFeatureAlert } from "./IdPayDisabledFeatureAlert";

export type IdPayFeatureKey = "idpay.onboarding" | "idpay.initiative_details";

const featureFlagSelectorMap: Record<
  IdPayFeatureKey,
  (state: GlobalState) => boolean
> = {
  "idpay.onboarding": isIdPayOnboardingEnabledSelector,
  "idpay.initiative_details": isIdPayDetailsEnabledSelector
};

type IdPayEnabledFeatureFlagGuardProps = {
  featureKey: IdPayFeatureKey;
};

export function IdPayEnabledFeatureFlagGuard({
  children,
  featureKey
}: PropsWithChildren<IdPayEnabledFeatureFlagGuardProps>) {
  const isEnabled = useIOSelector(featureFlagSelectorMap[featureKey]);
  if (!isEnabled) {
    return <IdPayDisabledFeatureAlert featureKey={featureKey} />;
  }
  return children;
}
