import {
  StoredCredential,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import { TrustmarkFailure } from "./failure";

export type Context = {
  /**
   * The credential type to get the trustmark for
   */
  credentialType: string;
  /**
   * The wallet instance attestation to be used to get the trustmark
   */
  walletInstanceAttestation?: WalletInstanceAttestations;
  /**
   * The credential to get the trustmark for
   */
  credential?: StoredCredential;
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
  /**
   * The failure of the trustmark machine
   */
  failure?: TrustmarkFailure;
  /**
   * The number of attempts made by the user to get the trustmark
   */
  attempts?: number;
  /**
   * Time after which the user can attempt again to get the trustmark
   */
  nextAttemptAt?: Date;
};
