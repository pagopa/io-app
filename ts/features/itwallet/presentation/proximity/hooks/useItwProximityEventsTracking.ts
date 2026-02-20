import { useEffect } from "react";
import {
  serializeFailureReason,
  shouldSerializeReason
} from "../../../common/utils/itwStoreUtils";
import { ProximityFailure, ProximityFailureType } from "../machine/failure";
import {
  trackItwProximityRPGenericFailure,
  trackItwProximityTimeout,
  trackItwProximityUnexpectedFailure,
  trackItwProximityUnofficialVerifier
} from "../analytics";
import { ItwProximityMachineContext } from "../machine/provider";
import { hasGivenConsentSelector } from "../machine/selectors";

type Params = {
  failure: ProximityFailure;
};

/**
 * Track errors occurred during the proximity presentation flow for analytics.
 */

export const useItwProximityEventsTracking = ({ failure }: Params) => {
  const hasGivenConsent = ItwProximityMachineContext.useSelector(
    hasGivenConsentSelector
  );
  useEffect(() => {
    const serializedFailure = serializeFailureReason(
      failure,
      "ITW_PROXIMITY_EVENTS_TRACKING"
    );
    switch (failure.type) {
      case ProximityFailureType.RELYING_PARTY_GENERIC:
        return trackItwProximityRPGenericFailure({
          reason: serializedFailure.reason,
          type: serializedFailure.type,
          proximity_sharing_status: hasGivenConsent ? "post" : "pre"
        });

      case ProximityFailureType.TIMEOUT:
        return trackItwProximityTimeout(serializedFailure);

      case ProximityFailureType.UNEXPECTED:
        return trackItwProximityUnexpectedFailure(
          shouldSerializeReason(failure) ? serializedFailure : failure
        );
      case ProximityFailureType.UNTRUSTED_RP:
        return trackItwProximityUnofficialVerifier(serializedFailure);
    }
  }, [failure, hasGivenConsent]);
};
