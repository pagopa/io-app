import { enumType } from "@pagopa/ts-commons/lib/types";
import * as t from "io-ts";

export enum CredentialIssuanceFailureTypeEnum {
  GENERIC = "GENERIC"
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
