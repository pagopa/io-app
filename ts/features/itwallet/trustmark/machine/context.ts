import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Context = {
  /**
   * The credential to get the trustmark for
   */
  credential: StoredCredential;
  /**
   * The expiration date of the trustmark
   */
  expirationDate?: Date;
  /**
   * The expiration time inseconds of the trustmark
   */
  expirationSeconds?: number;
  /**
   * The trustmark url
   */
  trustmarkUrl?: string;
};
