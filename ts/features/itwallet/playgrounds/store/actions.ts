import { ActionType, createStandardAction } from "typesafe-actions";
import {
  StoredCredential,
  ItwCredentialStatus
} from "../../common/utils/itwTypesUtils";

export const itwDebugSetGlobalStatusOverride = createStandardAction(
  "ITW_DEBUG_SET_GLOBAL_STATUS_OVERRIDE"
)<ItwCredentialStatus>();

export const itwDebugClearGlobalStatusOverride = createStandardAction(
  "ITW_DEBUG_CLEAR_GLOBAL_STATUS_OVERRIDE"
)();

export const itwDebugSaveOriginalCredentials = createStandardAction(
  "ITW_DEBUG_SAVE_ORIGINAL_CREDENTIALS"
)<ReadonlyArray<StoredCredential>>();

export type ItwDebugActions =
  | ActionType<typeof itwDebugSetGlobalStatusOverride>
  | ActionType<typeof itwDebugClearGlobalStatusOverride>
  | ActionType<typeof itwDebugSaveOriginalCredentials>;
