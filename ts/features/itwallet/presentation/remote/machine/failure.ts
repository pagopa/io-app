import { Credential, Errors } from "@pagopa/io-react-native-wallet";
import { isDefined } from "../../../../../utils/guards.ts";
import { RemoteEvents } from "./events.ts";

const { CredentialsNotFoundError } = Credential.Presentation.Errors;

export enum RemoteFailureType {
  WALLET_INACTIVE = "WALLET_INACTIVE",
  MISSING_CREDENTIALS = "MISSING_CREDENTIALS",
  EID_EXPIRED = "EID_EXPIRED",
  RELYING_PARTY_GENERIC = "RELYING_PARTY_GENERIC",
  RELYING_PARTY_INVALID_AUTH_RESPONSE = "RELYING_PARTY_INVALID_AUTH_RESPONSE",
  INVALID_REQUEST_OBJECT = "INVALID_REQUEST_OBJECT",
  UNTRUSTED_RP = "UNTRUSTED_RP",
  UNEXPECTED = "UNEXPECTED"
}
const { isRelyingPartyResponseError, RelyingPartyResponseErrorCodes: Codes } =
  Errors;

/**
 * Type that contains the possible error types thrown when the requested Request Object is invalid.
 */
type InvalidRequestObjectError =
  | Credential.Presentation.Errors.InvalidRequestObjectError
  | Credential.Presentation.Errors.DcqlError;

/**
 * Guard used to check if the error is of type `InvalidRequestObjectError`
 */
const isRequestObjectInvalidError = (
  error: unknown
): error is InvalidRequestObjectError =>
  error instanceof Credential.Presentation.Errors.InvalidRequestObjectError ||
  error instanceof Credential.Presentation.Errors.DcqlError;

/**
 * Type that maps known reasons with the corresponding failure, in order to avoid unknowns as much as possible.
 */
export type ReasonTypeByFailure = {
  [RemoteFailureType.WALLET_INACTIVE]: string;
  [RemoteFailureType.MISSING_CREDENTIALS]: {
    missingCredentials: Array<string>;
  };
  [RemoteFailureType.EID_EXPIRED]: string;
  [RemoteFailureType.RELYING_PARTY_GENERIC]: Errors.RelyingPartyResponseError;
  [RemoteFailureType.RELYING_PARTY_INVALID_AUTH_RESPONSE]: Errors.RelyingPartyResponseError;
  [RemoteFailureType.INVALID_REQUEST_OBJECT]: InvalidRequestObjectError;
  [RemoteFailureType.UNTRUSTED_RP]: string;
  [RemoteFailureType.UNEXPECTED]: unknown;
};

type TypedRemoteFailures = {
  [K in RemoteFailureType]: { type: K; reason: ReasonTypeByFailure[K] };
};

/**
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

  if (isRelyingPartyResponseError(error, Codes.InvalidAuthorizationResponse)) {
    return {
      type: RemoteFailureType.RELYING_PARTY_INVALID_AUTH_RESPONSE,
      reason: error
    };
  }
  if (isRelyingPartyResponseError(error, Codes.RelyingPartyGenericError)) {
    return {
      type: RemoteFailureType.RELYING_PARTY_GENERIC,
      reason: error
    };
  }
  if (isRequestObjectInvalidError(error)) {
    return {
      type: RemoteFailureType.INVALID_REQUEST_OBJECT,
      reason: error
    };
  }
  return {
    type: RemoteFailureType.UNEXPECTED,
    reason: String(error)
  };
};
