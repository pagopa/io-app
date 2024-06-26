import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Context = {
  hardwareKeyTag: string | undefined;
  walletAttestation: string | undefined;
  userToken: string | undefined;
  eid: StoredCredential | undefined;
};

export const InitialContext: Context = {
  hardwareKeyTag: undefined,
  walletAttestation: undefined,
  userToken: undefined,
  eid: undefined
};
