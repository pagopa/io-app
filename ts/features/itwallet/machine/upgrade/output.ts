import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Output = {
  /**
   * Credentials that encountered failures during the upgrade process
   */
  failedCredentials: ReadonlyArray<StoredCredential>;
};
