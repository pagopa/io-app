import { StoredCredential } from "../../common/utils/itwTypesUtils";

export type Input = {
  /**
   * The wallet instance attestation obtained during the PID upgrade
   */
  walletInstanceAttestation: string;
  /**
   * The upgrade PID credential
   */
  pid: StoredCredential;
  /**
   * Array of credentials that must be upgraded to L3
   */
  credentials: ReadonlyArray<StoredCredential>;
};
