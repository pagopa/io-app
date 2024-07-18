import {
  ActionType,
  createAction,
  createStandardAction
} from "typesafe-actions";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";

export const itwStoreIntegrityKeyTag = createStandardAction(
  "ITW_STORE_INTEGRITY_KEY_TAG"
)<string>();

export const itwStorePid =
  createStandardAction("ITW_STORE_PID")<StoredCredential>();

export const itwResetPid = createAction("ITW_RESET_PID");

export type ItwIssuanceActions =
  | ActionType<typeof itwStoreIntegrityKeyTag>
  | ActionType<typeof itwStorePid>
  | ActionType<typeof itwResetPid>;
