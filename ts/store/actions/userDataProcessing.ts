import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { UserDataProcessing } from "../../../definitions/backend/UserDataProcessing";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";

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

export const requestUserDataProcessing = createAsyncAction(
  "REQUEST_USER_DATA_PROCESSING_REQUEST",
  "REQUEST_USER_DATA_PROCESSING_SUCCESS",
  "REQUEST_USER_DATA_PROCESSING_FAILURE"
)<
  UserDataProcessingChoiceEnum,
  UserDataProcessing,
  { choice: UserDataProcessingChoiceEnum; error: Error }
>();

export const resetUserDataProcessingRequest = createStandardAction(
  "RESET_USER_DATA_PROCESSING_REQUEST"
)<UserDataProcessingChoiceEnum>();

export type UserDataProcessingActions =
  | ActionType<typeof loadUserDataProcessing>
  | ActionType<typeof requestUserDataProcessing>
  | ActionType<typeof resetUserDataProcessingRequest>;
