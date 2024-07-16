import { CredentialType } from "../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Context = {
  credentialType: CredentialType | undefined;
  hardwareKeyTag: string | undefined;
  walletAttestation: string | undefined;
  eid: StoredCredential | undefined;
  credential: StoredCredential | undefined;
};

export const InitialContext: Context = {
  credentialType: undefined,
  hardwareKeyTag: undefined,
  walletAttestation: undefined,
  eid: undefined,
  credential: undefined
};
