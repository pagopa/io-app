import { isItwProximityNfcMinAppVersionSupportedSelector } from "../../../common/store/selectors/remoteConfig";
import { itwProximityConsentExistsSelector } from "../store/selectors/consents";
import {
  generateConsentKey,
  getConsentDataFromProximityDetails
} from "../store/utils";
import { Context } from "./context";

type GuardArgs = {
  context: Context;
};

/** Gates contactless engagement against the current remote configuration. */
export const isNfcPresentmentSupportedGuard = ({ context }: GuardArgs) =>
  isItwProximityNfcMinAppVersionSupportedSelector(
    context.deps.store.getState()
  );

export const hasGrantedConsentGuard = ({ context }: GuardArgs) => {
  if (!context.proximityDetails) {
    return false;
  }

  const consentData = getConsentDataFromProximityDetails(
    context.proximityDetails
  );
  const consentKey = generateConsentKey(consentData);

  // Session consent: user already reviewed this exact request in the current session
  if (context.grantedConsentKey === consentKey) {
    return true;
  }

  // Persisted consent: user stored consent for this exact RP and claims combination
  return itwProximityConsentExistsSelector(consentData)(
    context.deps.store.getState()
  );
};
