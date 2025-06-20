import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Input = {
  /**
   * Array of credentials that must be upgraded to L3
   */
  credentials: ReadonlyArray<StoredCredential>;
};
