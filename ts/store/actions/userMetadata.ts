import { ActionType, createAsyncAction } from "typesafe-actions";
import { UserMetadata } from "../reducers/userMetadata";

export const userMetadataLoad = createAsyncAction(
  "USER_METEDATA_LOAD_REQUEST",
  "USER_METEDATA_LOAD_SUCCESS",
  "USER_METEDATA_LOAD_FAILURE"
)<void, UserMetadata, Error>();

export const userMetadataUpsert = createAsyncAction(
  "USER_METEDATA_UPSERT_REQUEST",
  "USER_METEDATA_UPSERT_SUCCESS",
  "USER_METEDATA_UPSERT_FAILURE"
)<UserMetadata, UserMetadata, Error>();

export type UserMetadataActions = ActionType<
  typeof userMetadataLoad | typeof userMetadataUpsert
>;
