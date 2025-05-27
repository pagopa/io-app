import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Context = {
  /**
   * Credentials that must be upgrade to L3
   */
  credentials: ReadonlyArray<StoredCredential>;
};

export const InitialContext: Context = {
  credentials: []
};
