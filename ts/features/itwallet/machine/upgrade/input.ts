import { StoredCredential } from "../../common/utils/itwTypesUtils";
import { EidIssuanceMode } from "../eid/context";

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
  /**
   * The issuance mode considered by the credential upgrade machine.
   * - "upgrade": upgrade from Documenti su IO to IT Wallet, upgrading also owned credentials.
   * - "reissuance": reissuing the eID on Documenti su IO, reissuing also owned credentials.
   */
  issuanceMode: EidIssuanceMode;
};
