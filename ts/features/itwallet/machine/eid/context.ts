import { type StoredCredential } from "../../common/utils/itwTypesUtils";
import { type IdentificationMode } from "./events";

export type Context = {
  hardwareKeyTag: string | undefined;
  walletAttestation: string | undefined;
  userToken: string | undefined;
  eid: StoredCredential | undefined;
  identificationMode: IdentificationMode | undefined;
};

export const InitialContext: Context = {
  hardwareKeyTag: undefined,
  walletAttestation: undefined,
  userToken: undefined,
  eid: undefined,
  identificationMode: undefined
};
