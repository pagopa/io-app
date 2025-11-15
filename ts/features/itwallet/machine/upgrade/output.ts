import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { UpgradeCredentialFailure } from "./failure";

export type Output = {
  /**
   * Credentials that encountered failures during the upgrade process
   */
  failedCredentials: ReadonlyArray<StoredCredential>;
  /**
   * Error message in case of upgrade process failure
   */
  failure?: UpgradeCredentialFailure | undefined;
};
