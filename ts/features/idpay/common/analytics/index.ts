import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { IdPayFeatureKey } from "../components/IdPayEnabledFeatureFlagGuard";

type EventProperties = {
  featureKey: IdPayFeatureKey;
};

const mapErrorByFeatureKey: Record<IdPayFeatureKey, string> = {
  "idpay.onboarding": "IDPAY_ONBOARDING_INGRESS_TIMEOUT",
  "idpay.initiative_details": "IDPAY_DETAILS_INGRESS_TIMEOUT"
};

const mapIngressScreenByFeatureKey: Record<IdPayFeatureKey, string> = {
  "idpay.onboarding": "IDPAY_ONBOARDING_INGRESS_SCREEN",
  "idpay.initiative_details": "IDPAY_DETAILS_INGRESS_SCREEN"
};

export const trackIDPayDisabledFeatureError = (props: EventProperties) => {
  mixpanelTrack(
    mapErrorByFeatureKey[props.featureKey],
    buildEventProperties("KO", "screen_view", props)
  );
};

export const trackIDPayDisabledFeatureIngressScreen = (
  props: EventProperties
) => {
  mixpanelTrack(
    mapIngressScreenByFeatureKey[props.featureKey],
    buildEventProperties("UX", "screen_view", props)
  );
};
