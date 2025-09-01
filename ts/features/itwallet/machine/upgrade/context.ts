import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { Input } from "./input";

export type Context = {
  /**
   * The wallet instance attestation obtained during the PID upgrade
   */
  walletInstanceAttestation: string;
  /**
   * The upgrade PID credential
   */
  pid: StoredCredential;
  /**
   * Credentials that must be upgraded to L3
   */
  credentials: ReadonlyArray<StoredCredential>;
  /**
   * The index of the current credential being processed
   */
  credentialIndex: number;
  /**
   * Credentials that failed the upgrade process
   */
  failedCredentials: ReadonlyArray<StoredCredential>;
};

export const getInitialContext = (input: Input): Context => ({
  walletInstanceAttestation: input.walletInstanceAttestation,
  pid: input.pid,
  credentials: input.credentials,
  credentialIndex: -1,
  failedCredentials: []
});
