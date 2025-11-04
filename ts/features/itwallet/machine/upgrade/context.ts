import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { EidIssuanceMode } from "../eid/context";
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
  /**
   * The issuance mode considered by the credential upgrade machine.
   * - "upgrade": upgrade from Documenti su IO to IT Wallet, upgrading also owned credentials.
   * - "reissuance": reissuing the eID on Documenti su IO, reissuing also owned credentials.
   */
  issuanceMode: EidIssuanceMode;
  /**
   * Error message in case of upgrade process failure
   */
  errorMessage?: string;
};

export const getInitialContext = (input: Input): Context => ({
  walletInstanceAttestation: input.walletInstanceAttestation,
  pid: input.pid,
  credentials: input.credentials,
  credentialIndex: -1,
  failedCredentials: [],
  issuanceMode: input.issuanceMode,
  errorMessage: undefined
});
