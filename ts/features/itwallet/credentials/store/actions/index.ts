import { ActionType, createStandardAction } from "typesafe-actions";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";

/**
 * This action stores one or multiple credentials using the credential type as key.
 * The new credential completely overwrites the previous one.
 */
export const itwCredentialsStore = createStandardAction(
  "ITW_CREDENTIALS_STORE"
)<Array<StoredCredential>>();

export const itwCredentialsRemove = createStandardAction(
  "ITW_CREDENTIALS_REMOVE"
)<StoredCredential>();

export const itwIpzsHasReadPolicy = createStandardAction(
  "ITW_HAS_READ_IPZS_POLICY"
)<boolean>();

export type ItwCredentialsActions =
  | ActionType<typeof itwCredentialsStore>
  | ActionType<typeof itwCredentialsRemove>
  | ActionType<typeof itwIpzsHasReadPolicy>;
