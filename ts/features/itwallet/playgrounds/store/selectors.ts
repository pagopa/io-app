import { GlobalState } from "../../../../store/reducers/types";
import {
  StoredCredential,
  ItwCredentialStatus
} from "../../common/utils/itwTypesUtils";

export const itwDebugCredentialStatusOverridesSelector = (
  state: GlobalState
): Record<string, ItwCredentialStatus> =>
  state.features.itWallet.debug?.credentialStatusOverrides ?? {};

export const itwDebugSavedCredentialsSelector = (
  state: GlobalState
): Record<string, StoredCredential> | undefined =>
  state.features.itWallet.debug?.savedCredentials;
