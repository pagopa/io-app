import { ActionType, createStandardAction } from "typesafe-actions";
import {
  StoredCredential,
  ItwCredentialStatus
} from "../../common/utils/itwTypesUtils";

export const itwDebugSetCredentialStatusOverride = createStandardAction(
  "ITW_DEBUG_SET_CREDENTIAL_STATUS_OVERRIDE"
)<{ credentialType: string; status: ItwCredentialStatus }>();

export const itwDebugClearCredentialStatusOverride = createStandardAction(
  "ITW_DEBUG_CLEAR_CREDENTIAL_STATUS_OVERRIDE"
)<{ credentialType: string }>();

export const itwDebugSaveOriginalCredentials = createStandardAction(
  "ITW_DEBUG_SAVE_ORIGINAL_CREDENTIALS"
)<ReadonlyArray<StoredCredential>>();

export const itwDebugReset = createStandardAction("ITW_DEBUG_RESET")();

export type ItwDebugActions =
  | ActionType<typeof itwDebugSetCredentialStatusOverride>
  | ActionType<typeof itwDebugClearCredentialStatusOverride>
  | ActionType<typeof itwDebugSaveOriginalCredentials>
  | ActionType<typeof itwDebugReset>;
