import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum CredentialIssuanceFailureEnum {
  GENERIC = "GENERIC"
}
export type CredentialIssuanceFailure = t.TypeOf<
  typeof CredentialIssuanceFailure
>;
export const CredentialIssuanceFailure =
  enumType<CredentialIssuanceFailureEnum>(
    CredentialIssuanceFailureEnum,
    "CredentialIssuanceFailureEnum"
  );
