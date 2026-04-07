import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { EidIssuanceMode } from "../eid/context";
import { Input } from "./input";

export type Context = {
  /**
   * The index of the current credential being processed
   */
  credentialIndex: number;
  /**
   * Credentials that must be upgraded to L3
   */
  credentials: ReadonlyArray<StoredCredential>;
  /**
   * Credentials that failed the upgrade process
   */
  failedCredentials: ReadonlyArray<StoredCredential>;
  /**
   * The issuance mode considered by the credential upgrade machine.
   * - "upgrade": upgrade from Documenti su IO to IT Wallet, upgrading also owned credentials.
   * - "reissuance": reissuing the eID on Documenti su IO, reissuing also owned credentials.
   */
  issuanceMode: EidIssuanceMode;
  /**
   * The upgrade PID credential
   */
  pid: StoredCredential;
  /**
   * The wallet instance attestation obtained during the PID upgrade
   */
  walletInstanceAttestation: string;
};

export const getInitialContext = (input: Input): Context => ({
  walletInstanceAttestation: input.walletInstanceAttestation,
  pid: input.pid,
  credentials: input.credentials,
  credentialIndex: -1,
  failedCredentials: [],
  issuanceMode: input.issuanceMode
});
