import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum UnsubscriptionFailureEnum {
  GENERIC = "GENERIC",
  SESSION_EXPIRED = "SESSION_EXPIRED",
  UNEXPECTED = "UNEXPECTED"
}

export type UnsubscriptionFailure = t.TypeOf<typeof UnsubscriptionFailure>;
export const UnsubscriptionFailure = enumType<UnsubscriptionFailureEnum>(
  UnsubscriptionFailureEnum,
  "UnsubscriptionFailureEnum"
);
