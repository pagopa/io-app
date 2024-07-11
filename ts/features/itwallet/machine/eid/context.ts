import { type StoredCredential } from "../../common/utils/itwTypesUtils";

export type Identification =
  | { mode: "ciePin" | "cieId" }
  | { mode: "spid"; idpId: string };

export type Context = {
  integrityKeyTag: string | undefined;
  walletAttestation: string | undefined;
  eid: StoredCredential | undefined;
  identification: Identification | undefined;
};

export const InitialContext: Context = {
  integrityKeyTag: undefined,
  walletAttestation: undefined,
  eid: undefined,
  identification: undefined
};
