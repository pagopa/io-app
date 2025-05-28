export type Context = {
  /**
   * Credentials that must be upgraded to L3
   */
  credentialsToUpgrade: ReadonlyArray<string>;
  /**
   * Credentials that failed the upgrade
   */
  failedCredentials: ReadonlyArray<string>;
};

export const InitialContext: Context = {
  credentialsToUpgrade: [],
  failedCredentials: []
};
