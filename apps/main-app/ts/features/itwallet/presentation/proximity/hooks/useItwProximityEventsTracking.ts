import { useEffect } from "react";

import { isDefined } from "../../../../../utils/guards";
import {
  serializeFailureReason,
  shouldSerializeReason
} from "../../../common/utils/itwStoreUtils";
import {
  trackItwProximityGenericFailure,
  trackItwProximityMandatoryCredentialMissing,
  trackItwProximityNfcSessionError,
  trackItwProximityNfcSessionTimeout,
  trackItwProximityRPGenericFailure,
  trackItwProximityRpNotTrusted,
  trackItwProximityTimeout,
  trackItwProximityUnexpectedFailure
} from "../analytics";
import { ProximityFailure, ProximityFailureType } from "../machine/failure";
import { ItwProximityMachineContext } from "../machine/provider";
import {
  hasGivenConsentSelector,
  selectIsNfcRetrieval
} from "../machine/selectors";

type Params = {
  failure: ProximityFailure;
  getCredentialTypeFromDocType: (
    docType: string | undefined
  ) => string | undefined;
};

/**
 * Track errors occurred during the proximity presentation flow for analytics.
 */

export const useItwProximityEventsTracking = ({
  failure,
  getCredentialTypeFromDocType
}: Params) => {
  const hasGivenConsent = ItwProximityMachineContext.useSelector(
    hasGivenConsentSelector
  );
  const isNfcRetrieval =
    ItwProximityMachineContext.useSelector(selectIsNfcRetrieval);
  useEffect(() => {
    const serializedFailure = serializeFailureReason(failure);
    switch (failure.type) {
      case ProximityFailureType.MISSING_CREDENTIALS: {
        const missingCredentials = failure.reason.credentialsDocType
          .map(getCredentialTypeFromDocType)
          .filter(isDefined);

        return trackItwProximityMandatoryCredentialMissing({
          missing_credential: missingCredentials.join(" - "),
          missing_credential_number: missingCredentials.length
        });
      }

      case ProximityFailureType.RELYING_PARTY_GENERIC:
        trackItwProximityRPGenericFailure({
          reason: serializedFailure.reason,
          type: serializedFailure.type,
          proximity_sharing_status: hasGivenConsent ? "post" : "pre"
        });
        trackItwProximityGenericFailure({
          reason: serializedFailure.reason
        });
        if (isNfcRetrieval) {
          return trackItwProximityNfcSessionError(serializedFailure);
        }
        return;

      case ProximityFailureType.TIMEOUT:
        trackItwProximityTimeout(serializedFailure);
        if (isNfcRetrieval) {
          return trackItwProximityNfcSessionTimeout(serializedFailure);
        }
        return;

      case ProximityFailureType.UNEXPECTED:
        return trackItwProximityUnexpectedFailure(
          shouldSerializeReason(failure)
            ? { ...serializedFailure, origin: "ITW_PROXIMITY_EVENTS_TRACKING" }
            : failure
        );
      case ProximityFailureType.UNTRUSTED_RP:
        return trackItwProximityRpNotTrusted(serializedFailure);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [failure, hasGivenConsent, isNfcRetrieval]);
};
