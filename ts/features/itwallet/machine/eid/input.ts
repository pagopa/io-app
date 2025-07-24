import {
  StoredCredential,
  WalletInstanceAttestations
} from "../../common/utils/itwTypesUtils";

export type EidIssuanceInput = {
  /**
   * The integrity key tag used to verify the integrity of the wallet instance attestation.
   */
  integrityKeyTag?: string;
  /**
   * The wallet instance attestation JWT used to verify the wallet instance.
   */
  walletInstanceAttestation?: WalletInstanceAttestations;
  /**
   * The credentials that need to be upgraded to L3, if any
   */
  credentials?: ReadonlyArray<StoredCredential>;
};
