import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Input = {
  /**
   * The wallet instance attestation to be used to get the trustmark
   */
  walletInstanceAttestation: string;
  /**
   * The credential to get the trustmark for
   */
  credential: StoredCredential;
};
