import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import { IdPayFeatureKey } from "../components/IdPayEnabledFeatureFlagGuard";

type EventProperties = {
  featureKey: IdPayFeatureKey;
};

const mapIngressScreenByFeatureKey: Record<IdPayFeatureKey, string> = {
  "idpay.onboarding": "IDPAY_ONBOARDING_INGRESS_SCREEN",
  "idpay.initiative_details": "IDPAY_DETAILS_INGRESS_SCREEN"
};

export const trackIDPayDisabledFeatureIngressScreen = (
  props: EventProperties
) => {
  mixpanelTrack(
    mapIngressScreenByFeatureKey[props.featureKey],
    buildEventProperties("UX", "screen_view", props)
  );
};

type StaticCodeEventProperties = {
  initiativeName?: string;
  initiativeId?: string;
};
export const trackIDPayStaticCodeGeneration = (
  props: StaticCodeEventProperties
) => {
  mixpanelTrack(
    "IDPAY_STATIC_CODE_GENERATION",
    buildEventProperties("UX", "action", props)
  );
};
export const trackIDPayStaticCodeGenerationSuccess = (
  props: StaticCodeEventProperties
) => {
  mixpanelTrack(
    "IDPAY_STATIC_CODE_UX_CONVERSION",
    buildEventProperties("UX", "confirm", props)
  );
};
export const trackIDPayStaticCodeGenerationCopy = (
  props: StaticCodeEventProperties
) => {
  mixpanelTrack(
    "IDPAY_STATIC_CODE_COPY",
    buildEventProperties("UX", "action", props)
  );
};
export const trackIDPayStaticCodeGenerationError = (
  props: StaticCodeEventProperties
) => {
  mixpanelTrack(
    "IDPAY_CODE_GENERATION_ERROR",
    buildEventProperties("KO", "screen_view", props)
  );
};
