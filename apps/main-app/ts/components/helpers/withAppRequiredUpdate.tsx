import { useIOSelector } from "../../store/hooks";
import {
  fimsRequiresAppUpdateSelector,
  idPayDetailsRequiresAppUpdateSelector,
  idPayOnboardingRequiresAppUpdateSelector,
  isFciEnabledSelector,
  isPnAppVersionSupportedSelector
} from "../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../store/reducers/types";

// Keys accepted by the hook, add new keys here if you need to check for app update on a specific feature
export type AppUpdateFeatureKey =
  | "fci"
  | "fims"
  | "idpay.initiative_details"
  | "idpay.onboarding"
  | "send";

export type RequiredUpdateMixPanelTracking = {
  onConfirm: () => void;
  onLanding: () => void;
};

// Map key -> selector function (it must return true if the app needs to be updated, false otherwise)
// If you need to check for app update on a specific feature, add a new key here and the selector function
const featureUpdateSelectorMap: Record<
  AppUpdateFeatureKey,
  (state: GlobalState) => boolean
> = {
  fims: fimsRequiresAppUpdateSelector,
  "idpay.onboarding": idPayOnboardingRequiresAppUpdateSelector,
  "idpay.initiative_details": idPayDetailsRequiresAppUpdateSelector,
  send: (state: GlobalState) => !isPnAppVersionSupportedSelector(state),
  fci: (state: GlobalState) => !isFciEnabledSelector(state)
};

/** Returns true if the given feature requires an app update. */
export const useAppRequiredUpdate = (featureKey: AppUpdateFeatureKey) =>
  useIOSelector(featureUpdateSelectorMap[featureKey]);
