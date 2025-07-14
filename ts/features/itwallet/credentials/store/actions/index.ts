import { ActionType, createStandardAction } from "typesafe-actions";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";

/**
 * This action stores one or multiple credentials using the credential ID as key.
 * The new credential completely overwrites the previous one.
 */
export const itwCredentialsStore = createStandardAction(
  "ITW_CREDENTIALS_STORE"
)<Array<StoredCredential>>();

export const itwCredentialsRemove = createStandardAction(
  "ITW_CREDENTIALS_REMOVE"
)<StoredCredential>();

export type ItwCredentialsActions =
  | ActionType<typeof itwCredentialsStore>
  | ActionType<typeof itwCredentialsRemove>;
