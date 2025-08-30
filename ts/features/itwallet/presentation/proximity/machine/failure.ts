import {
  TimeoutError,
  UntrustedRpError
} from "../utils/itwProximityErrors.tsx";
import { ProximityEvents } from "./events.ts";

export enum ProximityFailureType {
  RELYING_PARTY_GENERIC = "RELYING_PARTY_GENERIC",
  TIMEOUT = "TIMEOUT",
  UNEXPECTED = "UNEXPECTED",
  UNTRUSTED_RP = "UNTRUSTED_RP"
}

/**
 * Type that maps known reasons with the corresponding failure, in order to avoid unknowns as much as possible.
 */
export type ReasonTypeByFailure = {
  [ProximityFailureType.RELYING_PARTY_GENERIC]: Error;
  [ProximityFailureType.TIMEOUT]: TimeoutError;
  [ProximityFailureType.UNEXPECTED]: unknown;
  [ProximityFailureType.UNTRUSTED_RP]: UntrustedRpError;
};

type TypedProximityFailures = {
  [K in ProximityFailureType]: { type: K; reason: ReasonTypeByFailure[K] };
};

/**
 * Union type of failures with the reason properly typed.
 */
export type ProximityFailure =
  TypedProximityFailures[keyof TypedProximityFailures];

/**
 * Maps an event dispatched by the proximity presentation machine to a failure object.
 * If the event contains an error, it is mapped to an unexpected failure.
 * @param event - The event to map
 * @returns A failure object which can be used to handle errors appropriately.
 */
export const mapEventToFailure = (event: ProximityEvents): ProximityFailure => {
  if (!("error" in event)) {
    return {
      type: ProximityFailureType.UNEXPECTED,
      reason: event
    };
  }

  const { error } = event;

  if (error instanceof TimeoutError) {
    return {
      type: ProximityFailureType.TIMEOUT,
      reason: error
    };
  }

  if (error instanceof UntrustedRpError) {
    return {
      type: ProximityFailureType.UNTRUSTED_RP,
      reason: error
    };
  }

  return {
    type: ProximityFailureType.RELYING_PARTY_GENERIC,
    reason: error
  };
};
