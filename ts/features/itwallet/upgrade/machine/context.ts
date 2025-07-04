import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Context = {
  /**
   * Credentials that must be upgraded to L3
   */
  credentialsToUpgrade: ReadonlyArray<StoredCredential>;
  /**
   * Credentials that failed the upgrade
   */
  failedCredentials: ReadonlyArray<StoredCredential>;
};

export const InitialContext: Context = {
  credentialsToUpgrade: [],
  failedCredentials: []
};
