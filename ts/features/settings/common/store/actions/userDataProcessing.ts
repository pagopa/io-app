import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { UserDataProcessing } from "../../../../../../definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../../../../definitions/backend/UserDataProcessingChoice";

export const loadUserDataProcessing = createAsyncAction(
  "LOAD_USER_DATA_PROCESSING_REQUEST",
  "LOAD_USER_DATA_PROCESSING_SUCCESS",
  "LOAD_USER_DATA_PROCESSING_FAILURE"
)<
  UserDataProcessingChoiceEnum,
  {
    choice: UserDataProcessingChoiceEnum;
    value?: UserDataProcessing;
  },
  { choice: UserDataProcessingChoiceEnum; error: Error }
>();

export const upsertUserDataProcessing = createAsyncAction(
  "UPSERT_USER_DATA_PROCESSING_REQUEST",
  "UPSERT_USER_DATA_PROCESSING_SUCCESS",
  "UPSERT_USER_DATA_PROCESSING_FAILURE"
)<
  UserDataProcessingChoiceEnum,
  UserDataProcessing,
  { choice: UserDataProcessingChoiceEnum; error: Error }
>();

export const deleteUserDataProcessing = createAsyncAction(
  "DELETE_USER_DATA_PROCESSING_REQUEST",
  "DELETE_USER_DATA_PROCESSING_SUCCESS",
  "DELETE_USER_DATA_PROCESSING_FAILURE"
)<
  UserDataProcessingChoiceEnum,
  {
    choice: UserDataProcessingChoiceEnum;
  },
  { choice: UserDataProcessingChoiceEnum; error: Error }
>();

export const resetUserDataProcessingRequest = createStandardAction(
  "RESET_USER_DATA_PROCESSING_REQUEST"
)<UserDataProcessingChoiceEnum>();

export const resetDeleteUserDataProcessing = createStandardAction(
  "RESET_DELETE_USER_DATA_PROCESSING"
)();

export type UserDataProcessingActions =
  | ActionType<typeof loadUserDataProcessing>
  | ActionType<typeof upsertUserDataProcessing>
  | ActionType<typeof deleteUserDataProcessing>
  | ActionType<typeof resetDeleteUserDataProcessing>
  | ActionType<typeof resetUserDataProcessingRequest>;
