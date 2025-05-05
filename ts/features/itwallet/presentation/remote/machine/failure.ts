import { Credential } from "@pagopa/io-react-native-wallet";
import { isDefined } from "../../../../../utils/guards.ts";
import { RemoteEvents } from "./events.ts";

const { CredentialsNotFoundError } = Credential.Presentation.Errors;

export enum RemoteFailureType {
  WALLET_INACTIVE = "WALLET_INACTIVE",
  MISSING_CREDENTIALS = "MISSING_CREDENTIALS",
  EID_EXPIRED = "EID_EXPIRED",
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
  [RemoteFailureType.EID_EXPIRED]: string;
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
  if (!("error" in event)) {
    return {
      type: RemoteFailureType.UNEXPECTED,
      reason: event
    };
  }

  const { error } = event;

  if (error instanceof CredentialsNotFoundError) {
    return {
      type: RemoteFailureType.MISSING_CREDENTIALS,
      // Missing credentials are identified by their VCT
      reason: {
        missingCredentials: error.details
          .flatMap(c => c.vctValues)
          .filter(isDefined)
      }
    };
  }

  return {
    type: RemoteFailureType.UNEXPECTED,
    reason: String(error)
  };
};
