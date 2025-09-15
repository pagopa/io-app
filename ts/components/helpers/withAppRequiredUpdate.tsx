import { ComponentType } from "react";
import { useIOSelector } from "../../store/hooks";
import {
  fimsRequiresAppUpdateSelector,
  idPayDetailsRequiresAppUpdateSelector,
  idPayOnboardingRequiresAppUpdateSelector,
  isPnAppVersionSupportedSelector
} from "../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../store/reducers/types";
import { UpdateAppAlert } from "../UpdateAppAlert";

// Keys accepted by the HOC, add new keys here if you need to check for app update on a specific feature
export type AppUpdateFeatureKey =
  | "fims"
  | "idpay.onboarding"
  | "idpay.initiative_details"
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
  send: (state: GlobalState) => !isPnAppVersionSupportedSelector(state)
};

/**
 * HOC that shows UpdateAppModal if the feature requires an app update, otherwise shows the wrapped component.
 * @param WrappedComponent - The component to wrap
 * @param featureKey - The key of the feature to check
 * @param mixPanelTracking - Optional MixPanel tracking function to be called when the update modal is shown it must be an object with two properties:
 *  - onConfirm: function to be called when the user confirms to update the app
 *  - onLanding: function to be called when the user lands on the update screen
 * @returns The wrapped component or the UpdateAppModal if the feature requires an app update
 */
export function withAppRequiredUpdate<P>(
  WrappedComponent: ComponentType<P>,
  featureKey: AppUpdateFeatureKey,
  mixPanelTracking?: RequiredUpdateMixPanelTracking
): ComponentType<P> {
  return (props: any) => {
    const requiresUpdate = useIOSelector(featureUpdateSelectorMap[featureKey]);
    if (requiresUpdate) {
      return <UpdateAppAlert mixPanelTracking={mixPanelTracking} />;
    }
    return <WrappedComponent {...props} />;
  };
}
