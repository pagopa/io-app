import { RemotePresentationEvents } from "./events";

export enum RemotePresentationFailureType {
  UNEXPECTED = "UNEXPECTED" 
}

export type RemotePresentationFailure = {
  type: RemotePresentationFailureType;
  reason: unknown; 
};

/**
 * Maps an event dispatched by the remote presentation machine to a failure object.
 * If the event contains an error, it is mapped to an unexpected failure.
 * @param event - The event to map
 * @returns A failure object which can be used to handle errors appropriately.
 */
export const mapEventToFailure = (event: RemotePresentationEvents): RemotePresentationFailure => {
  if ("error" in event) {
    const { error } = event;

    return {
      type: RemotePresentationFailureType.UNEXPECTED,
      reason: String(error) 
    };
  }

  return {
    type: RemotePresentationFailureType.UNEXPECTED,
    reason: event 
  };
};