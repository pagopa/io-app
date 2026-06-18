import { useIOStore } from "../../../../../store/hooks";
import { itwProximityConsentExistsSelector } from "../store/selectors/consents";
import {
  generateConsentKey,
  getConsentDataFromProximityDetails
} from "../store/utils";
import { Context } from "./context";

export const createProximityGuardsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  hasGrantedConsent: ({ context }: { context: Context }) => {
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
    return itwProximityConsentExistsSelector(consentData)(store.getState());
  }
});
