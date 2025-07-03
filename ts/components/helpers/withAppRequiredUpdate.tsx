import { ComponentType } from "react";
import { useIOSelector } from "../../store/hooks";
import {
  fimsRequiresAppUpdateSelector,
  idPayDetailsRequiresAppUpdateSelector,
  idPayOnboardingRequiresAppUpdateSelector
} from "../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../store/reducers/types";
import { UpdateAppAlert } from "../UpdateAppAlert";

// Keys accepted by the HOC, add new keys here if you need to check for app update on a specific feature
export type AppUpdateFeatureKey =
  | "fims"
  | "idpay.onboarding"
  | "idpay.initiative_details";

// Map key -> selector function (it must return true if the app needs to be updated, false otherwise)
// If you need to check for app update on a specific feature, add a new key here and the selector function
const featureUpdateSelectorMap: Record<
  AppUpdateFeatureKey,
  (state: GlobalState) => boolean
> = {
  fims: fimsRequiresAppUpdateSelector,
  "idpay.onboarding": idPayOnboardingRequiresAppUpdateSelector,
  "idpay.initiative_details": idPayDetailsRequiresAppUpdateSelector
};

/**
 * HOC that shows UpdateAppModal if the feature requires an app update, otherwise shows the wrapped component.
 * @param WrappedComponent - The component to wrap
 * @param featureKey - The key of the feature to check
 */
export function withAppRequiredUpdate<P>(
  WrappedComponent: ComponentType<P>,
  featureKey: AppUpdateFeatureKey
): ComponentType<P> {
  return (props: any) => {
    const requiresUpdate = useIOSelector(featureUpdateSelectorMap[featureKey]);
    if (requiresUpdate) {
      return <UpdateAppAlert />;
    }
    return <WrappedComponent {...props} />;
  };
}
