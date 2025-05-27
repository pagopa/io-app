import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Input = {
  /**
   * Credentials that must be upgrade to L3
   */
  credentials: ReadonlyArray<StoredCredential>;
};
