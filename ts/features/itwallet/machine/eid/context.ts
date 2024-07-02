import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Context = {
  walletAttestation: string | undefined;
  userToken: string | undefined;
  eid: StoredCredential | undefined;
};

export const InitialContext: Context = {
  walletAttestation: undefined,
  userToken: undefined,
  eid: undefined
};
