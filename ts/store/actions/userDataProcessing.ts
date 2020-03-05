import { ActionType, createAsyncAction } from "typesafe-actions";
import { UserDataProcessingChoiceEnum } from "../../../definitions/backend/UserDataProcessingChoice";
import { UserMetadata } from "../reducers/userMetadata";

export const userDataProcessingLoad = createAsyncAction(
  "USER_DATA_PROCESSING_LOAD_REQUEST",
  "USER_DATA_PROCESSING_LOAD_SUCCESS",
  "USER_DATA_PROCESSING_LOAD_FAILURE"
)<UserDataProcessingChoiceEnum, UserMetadata, Error>();

export const userDataProcessingUpsert = createAsyncAction(
  "USER_DATA_PROCESSING_UPSERT_REQUEST",
  "USER_DATA_PROCESSING_UPSERT_SUCCESS",
  "USER_DATA_PROCESSING_UPSERT_FAILURE"
)<UserMetadata, UserMetadata, Error>();

export type UserDataProcessingActions = ActionType<
  typeof userDataProcessingLoad | typeof userDataProcessingUpsert
>;
