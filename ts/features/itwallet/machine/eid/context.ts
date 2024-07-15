import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Context = {
  integrityKeyTag: string | undefined;
  walletAttestation: string | undefined;
  userToken: string | undefined;
  eid: StoredCredential | undefined;
};

export const InitialContext: Context = {
  integrityKeyTag: undefined,
  walletAttestation: undefined,
  userToken: undefined,
  eid: undefined
};
