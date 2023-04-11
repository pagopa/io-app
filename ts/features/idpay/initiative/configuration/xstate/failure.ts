import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum InitiativeFailureType {
  GENERIC = "GENERIC",
  INITIATIVE_ERROR = "INITIATIVE_ERROR",
  IBAN_LIST_LOAD_FAILURE = "IBAN_LIST_LOAD_FAILURE",
  IBAN_ENROLL_FAILURE = "IBAN_ENROLL_FAILURE",
  INSTRUMENTS_LIST_LOAD_FAILURE = "INSTRUMENTS_LIST_LOAD_FAILURE",
  INSTRUMENT_ENROLL_FAILURE = "INSTRUMENT_ENROLL_FAILURE",
  INSTRUMENT_DELETE_FAILURE = "INSTRUMENT_DELETE_FAILURE"
}
export type InitiativeFailure = t.TypeOf<typeof InitiativeFailure>;
export const InitiativeFailure = enumType<InitiativeFailureType>(
  InitiativeFailureType,
  "InitiativeFailureType"
);
