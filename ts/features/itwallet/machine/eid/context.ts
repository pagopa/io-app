import { type StoredCredential } from "../../common/utils/itwTypesUtils";

export type Identification =
  | { mode: "ciePin" | "cieId" }
  | { mode: "spid"; idpId: string };

export type Context = {
  hardwareKeyTag: string | undefined;
  walletAttestation: string | undefined;
  userToken: string | undefined;
  eid: StoredCredential | undefined;
  identification: Identification | undefined;
};

export const InitialContext: Context = {
  hardwareKeyTag: undefined,
  walletAttestation: undefined,
  userToken: undefined,
  eid: undefined,
  identification: undefined
};
