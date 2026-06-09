import { useIOStore } from "../../../../../store/hooks";
import { itwProximityConsentExistsSelector } from "../store/selectors/consents";
import { getConsentDataFromProximityDetails } from "../store/utils";
import { Context } from "./context";

export const createProximityGuardsImplementation = (
  store: ReturnType<typeof useIOStore>
) => ({
  hasGrantedConsent: ({ context }: { context: Context }) => {
    if (!context.proximityDetails) {
      return false;
    }

    if (context.hasGrantedConsent === true) {
      // User granted consent for the current session
      return true;
    }

    const consentData = getConsentDataFromProximityDetails(
      "IPZS", // TODO - use actual RP ID when available instead of hardcoding
      context.proximityDetails
    );

    // Check if user stored the consent for the current RP ID and proximity details
    return itwProximityConsentExistsSelector(consentData)(store.getState());
  }
});
