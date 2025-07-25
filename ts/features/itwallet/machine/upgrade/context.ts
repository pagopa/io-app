import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { Input } from "./input";

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

export const getInitialContext = (input: Input): Context => ({
  credentialsToUpgrade: input.credentials,
  failedCredentials: []
});
