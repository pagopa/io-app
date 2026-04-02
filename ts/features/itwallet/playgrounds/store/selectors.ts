import { GlobalState } from "../../../../store/reducers/types";
import {
  StoredCredential,
  ItwCredentialStatus
} from "../../common/utils/itwTypesUtils";

export const itwDebugGlobalStatusOverrideSelector = (
  state: GlobalState
): ItwCredentialStatus | undefined =>
  state.features.itWallet.debug?.globalCredentialStatusOverride;

export const itwDebugSavedCredentialsSelector = (
  state: GlobalState
): Record<string, StoredCredential> | undefined =>
  state.features.itWallet.debug?.savedCredentials;
