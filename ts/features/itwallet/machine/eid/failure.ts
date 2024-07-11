import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum IssuanceFailureType {
  GENERIC = "GENERIC",
  UNSUPPORTED_DEVICE = "UNSUPPORTED_DEVICE",
  NOT_MATCHING_IDENTITY = "NOT_MATCHING_IDENTITY"
}
export type IssuanceFailure = t.TypeOf<typeof IssuanceFailure>;
export const IssuanceFailure = enumType<IssuanceFailureType>(
  IssuanceFailureType,
  "IssuanceFailureType"
);
