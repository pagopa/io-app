import { RemoteEvents } from "./events.ts";

export enum RemoteFailureType {
  WALLET_INACTIVE = "WALLET_INACTIVE",
  MISSING_CREDENTIALS = "MISSING_CREDENTIALS",
  UNEXPECTED = "UNEXPECTED"
}

/**
 * Type that maps known reasons with the corresponding failure, in order to avoid unknowns as much as possible.
 */
export type ReasonTypeByFailure = {
  [RemoteFailureType.WALLET_INACTIVE]: string;
  [RemoteFailureType.MISSING_CREDENTIALS]: {
    missingCredentials: Array<string>;
  };
  [RemoteFailureType.UNEXPECTED]: unknown;
};

type TypedRemoteFailures = {
  [K in RemoteFailureType]: { type: K; reason: ReasonTypeByFailure[K] };
};

/*
 * Union type of failures with the reason properly typed.
 */
export type RemoteFailure = TypedRemoteFailures[keyof TypedRemoteFailures];

/**
 * Maps an event dispatched by the remote presentation machine to a failure object.
 * If the event contains an error, it is mapped to an unexpected failure.
 * @param event - The event to map
 * @returns A failure object which can be used to handle errors appropriately.
 */
export const mapEventToFailure = (event: RemoteEvents): RemoteFailure => {
  if ("error" in event) {
    const { error } = event;

    return {
      type: RemoteFailureType.UNEXPECTED,
      reason: String(error)
    };
  }

  return {
    type: RemoteFailureType.UNEXPECTED,
    reason: event
  };
};
