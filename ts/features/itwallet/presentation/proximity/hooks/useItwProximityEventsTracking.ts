import { useEffect } from "react";
import { serializeFailureReason } from "../../../common/utils/itwStoreUtils";
import { ProximityFailure, ProximityFailureType } from "../machine/failure";
import {
  trackItwProximityRPGenericFailure,
  trackItwProximityTimeout,
  trackItwProximityUnexpectedFailure
} from "../analytics";
import { ItwProximityMachineContext } from "../machine/provider";
import { hasGiventConsentSelector } from "../machine/selectors";

type Params = {
  failure: ProximityFailure;
};

/**
 * Track errors occurred during the proximity presentation flow for analytics.
 */
export const useItwProximityEventsTracking = ({ failure }: Params) => {
  const hasGiventConsent = ItwProximityMachineContext.useSelector(
    hasGiventConsentSelector
  );
  useEffect(() => {
    const serializedFailure = serializeFailureReason(failure);
    switch (failure.type) {
      case ProximityFailureType.RELYING_PARTY_GENERIC:
        return trackItwProximityRPGenericFailure({
          reason: serializedFailure,
          proximity_sharing_status: hasGiventConsent ? "post" : "pre"
        });

      case ProximityFailureType.TIMEOUT:
        return trackItwProximityTimeout(serializedFailure);

      case ProximityFailureType.UNEXPECTED:
        const shouldSerializeReason =
          !failure.reason ||
          (typeof failure.reason === "object" &&
            Object.keys(failure.reason).length === 0);

            return trackItwProximityUnexpectedFailure(
              shouldSerializeReason ? serializedFailure : failure
            );
    }
  }, [failure, hasGiventConsent]);
};
