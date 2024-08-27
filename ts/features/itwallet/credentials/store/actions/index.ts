import { ActionType, createStandardAction } from "typesafe-actions";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";

export const itwCredentialsStore = createStandardAction(
  "ITW_CREDENTIALS_STORE"
)<StoredCredential>();

export const itwCredentialsRemove = createStandardAction(
  "ITW_CREDENTIALS_REMOVE"
)<StoredCredential>();

/**
 * This action updates multiple credentials using their type as key.
 * The rest of the properties are merged with the original credential.
 */
export const itwCredentialsMultipleUpdate = createStandardAction(
  "ITW_CREDENTIALS_MULTIPLE_UPDATE"
)<
  Array<Partial<StoredCredential> & Pick<StoredCredential, "credentialType">>
>();

export type ItwCredentialsActions =
  | ActionType<typeof itwCredentialsStore>
  | ActionType<typeof itwCredentialsRemove>
  | ActionType<typeof itwCredentialsMultipleUpdate>;
