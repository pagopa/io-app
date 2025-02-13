import { RemoteEvents } from "./events.ts";

export enum RemoteFailureType {
  UNEXPECTED = "UNEXPECTED",
  WALLET_INACTIVE = "WALLET_INACTIVE"
}

export type RemoteFailure = {
  type: RemoteFailureType;
  reason: unknown;
};

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
