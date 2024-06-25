import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Context = {
  credentialType: CredentialType | undefined;
  walletAttestation: string | undefined;
  eid: StoredCredential | undefined;
  credential: StoredCredential | undefined;
};

export const InitialContext: Context = {
  credentialType: undefined,
  walletAttestation: undefined,
  eid: undefined,
  credential: undefined
};
