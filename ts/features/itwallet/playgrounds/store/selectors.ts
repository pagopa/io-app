import { GlobalState } from "../../../../store/reducers/types";
import {
  CredentialMetadata,
  ItwCredentialStatus
} from "../../common/utils/itwTypesUtils";

export const itwDebugCredentialStatusOverridesSelector = (
  state: GlobalState
): Record<string, ItwCredentialStatus> =>
  state.features.itWallet.debug?.credentialStatusOverrides ?? {};

export const itwDebugSavedCredentialsSelector = (
  state: GlobalState
): Record<string, CredentialMetadata> | undefined =>
  state.features.itWallet.debug?.savedCredentials;
