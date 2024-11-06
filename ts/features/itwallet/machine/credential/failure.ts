import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";
import { Errors } from "@pagopa/io-react-native-wallet";
import { assert } from "../../../../utils/assert";
import { CredentialIssuanceEvents } from "./events";

export enum CredentialIssuanceFailureTypeEnum {
  GENERIC = "GENERIC",
  ASYNC_ISSUANCE = "ASYNC_ISSUANCE",
  INVALID_STATUS = "INVALID_STATUS"
}

export const CredentialIssuanceFailureType =
  enumType<CredentialIssuanceFailureTypeEnum>(
    CredentialIssuanceFailureTypeEnum,
    "CredentialIssuanceFailureTypeEnum"
  );

export type CredentialIssuanceFailureType = t.TypeOf<
  typeof CredentialIssuanceFailureType
>;

const CredentialIssuanceFailureR = t.type({
  type: CredentialIssuanceFailureType
});

const CredentialIssuanceFailureO = t.partial({
  reason: t.unknown
});

export const CredentialIssuanceFailure = t.intersection(
  [CredentialIssuanceFailureR, CredentialIssuanceFailureO],
  "CredentialIssuanceFailure"
);

export type CredentialIssuanceFailure = t.TypeOf<
  typeof CredentialIssuanceFailure
>;

export const isCredentialInvalidStatusError = (
  error: CredentialIssuanceFailure
): error is {
  type: CredentialIssuanceFailureTypeEnum.INVALID_STATUS;
  reason: Errors.CredentialInvalidStatusError;
} => error.type === CredentialIssuanceFailureTypeEnum.INVALID_STATUS;

/**
 * Maps an event dispatched by the credential issuance machine to a failure object.
 * If the event is not an error event, a generic failure is returned.
 * @param event - The event to map
 * @param context - The machine context
 * @returns a failure object which can be used to fill the failure screen with the appropriate content
 */
export const mapEventToFailure = (
  event: CredentialIssuanceEvents
): CredentialIssuanceFailure => {
  try {
    assert("error" in event && event.error, "Not an error event");
    const error = event.error;

    if (error instanceof Errors.CredentialInvalidStatusError) {
      return {
        type: CredentialIssuanceFailureTypeEnum.INVALID_STATUS,
        reason: error
      };
    }

    if (error instanceof Errors.CredentialIssuingNotSynchronousError) {
      return {
        type: CredentialIssuanceFailureTypeEnum.ASYNC_ISSUANCE,
        reason: error
      };
    }

    return {
      type: CredentialIssuanceFailureTypeEnum.GENERIC,
      reason: error
    };
  } catch (e) {
    return {
      type: CredentialIssuanceFailureTypeEnum.GENERIC,
      reason: e
    };
  }
};
