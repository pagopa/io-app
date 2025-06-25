import { ProximityEvents } from "./events.ts";

export class InvalidRequestedDocumentsError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export enum ProximityFailureType {
  INVALID_REQUESTED_DOCUMENTS = "INVALID_REQUESTED_DOCUMENTS",
  RELYING_PARTY_GENERIC = "RELYING_PARTY_GENERIC",
  UNEXPECTED = "UNEXPECTED"
}

/**
 * Type that maps known reasons with the corresponding failure, in order to avoid unknowns as much as possible.
 */
export type ReasonTypeByFailure = {
  [ProximityFailureType.INVALID_REQUESTED_DOCUMENTS]: InvalidRequestedDocumentsError;
  [ProximityFailureType.RELYING_PARTY_GENERIC]: Error;
  [ProximityFailureType.UNEXPECTED]: unknown;
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

  if (error instanceof InvalidRequestedDocumentsError) {
    return {
      type: ProximityFailureType.INVALID_REQUESTED_DOCUMENTS,
      reason: error
    };
  }

  return {
    type: ProximityFailureType.UNEXPECTED,
    reason: String(error)
  };
};
