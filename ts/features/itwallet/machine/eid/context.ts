import { type StoredCredential } from "../../common/utils/itwTypesUtils";
import { IssuanceFailure } from "./failure";

export type Identification =
  | { mode: "ciePin" | "cieId" }
  | { mode: "spid"; idpId: string };

export type Context = {
  integrityKeyTag: string | undefined;
  eid: StoredCredential | undefined;
  identification: Identification | undefined;
  failure: IssuanceFailure | undefined;
};

export const InitialContext: Context = {
  integrityKeyTag: undefined,
  eid: undefined,
  identification: undefined,
  failure: undefined
};
