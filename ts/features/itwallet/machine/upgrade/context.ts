import {
  CredentialAccessToken,
  CredentialBundle,
  CredentialMetadata,
  IssuerConfiguration,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";
import { EidIssuanceMode } from "../eid/context";
import { Input } from "./input";

export type Context = {
  /** The wallet instance attestation obtained during the PID upgrade */
  walletInstanceAttestation: WalletInstanceAttestations | undefined;
  /** The upgrade PID credential */
  pid: CredentialBundle | undefined;
  /** Credentials that must be upgraded to L3 */
  credentials: ReadonlyArray<CredentialMetadata>;
  /** The index of the current credential being processed */
  credentialIndex: number;
  /** Credentials that failed the upgrade process */
  failedCredentials: ReadonlyArray<CredentialMetadata>;
  /**
   * The issuance mode considered by the credential upgrade machine. -
   * "upgrade": upgrade from Documenti su IO to IT Wallet, upgrading also owned
   * credentials. - "reissuance": reissuing the eID on Documenti su IO,
   * reissuing also owned credentials.
   */
  issuanceMode: EidIssuanceMode;
  /**
   * The integrity key tag that will be used when requesting the Wallet Unit
   * Attestation.
   */
  integrityKeyTag: string | undefined;
  /** Credential Issuer configuration. */
  issuerConf: IssuerConfiguration | undefined;
  /**
   * The access token obtained from the Issuer. If the session with the Wallet
   * Provider expires before requesting the credential, this token is used to
   * retry the request.
   */
  accessToken: CredentialAccessToken | undefined;
  clientId: string | undefined;
};

export const getInitialContext = (input: Input): Context => ({
  walletInstanceAttestation: undefined,
  pid: undefined,
  credentials: input.credentials,
  credentialIndex: -1,
  failedCredentials: [],
  issuanceMode: input.issuanceMode,
  integrityKeyTag: undefined,
  issuerConf: undefined,
  accessToken: undefined,
  clientId: undefined
});
