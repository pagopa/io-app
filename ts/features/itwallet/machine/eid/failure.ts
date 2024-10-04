import { Errors } from "@pagopa/io-react-native-wallet";
import { assert } from "../../../../utils/assert";
import { EidIssuanceEvents } from "./events";

export enum IssuanceFailureType {
  GENERIC = "GENERIC",
  ISSUER_GENERIC = "ISSUER_GENERIC",
  UNSUPPORTED_DEVICE = "UNSUPPORTED_DEVICE",
  NOT_MATCHING_IDENTITY = "NOT_MATCHING_IDENTITY"
}

export type IssuanceFailure = {
  type: IssuanceFailureType;
  reason?: unknown;
};

/**
 * Maps an event dispatched by the eID issuance machine to a failure object.
 * If the event is not an error event, a generic failure is returned.
 * @param event - The event to map
 * @returns a failure object which can be used to fill the failure screen with the appropriate content
 */
export const mapEventToFailure = (
  event: EidIssuanceEvents
): IssuanceFailure => {
  try {
    assert("error" in event && event.error, "Not an error event");
    const error = event.error;
    if (
      error instanceof Errors.WalletInstanceCreationIntegrityError ||
      error instanceof Errors.WalletInstanceIntegrityFailedError
    ) {
      return {
        type: IssuanceFailureType.UNSUPPORTED_DEVICE,
        reason: error
      };
    } else {
      return {
        type: IssuanceFailureType.GENERIC,
        reason: error
      };
    }
  } catch (e) {
    return {
      type: IssuanceFailureType.GENERIC,
      reason: e
    };
  }
};
