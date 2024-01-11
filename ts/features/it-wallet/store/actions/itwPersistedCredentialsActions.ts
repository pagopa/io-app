import { ActionType, createStandardAction } from "typesafe-actions";
import { StoredCredential } from "../../utils/itwTypesUtils";

/**
 * Action to add a credential to the wallet.
 */
export const itwPersistedCredentialsStore = createStandardAction(
  "ITW_CREDENTIALS_STORE"
)<StoredCredential>();

/**
 * Type for credentials related actions.
 */
export type ItwPersistedCredentialsActions = ActionType<
  typeof itwPersistedCredentialsStore
>;
