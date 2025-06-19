import { createSelector } from "reselect";
import * as O from "fp-ts/lib/Option";
import { itwCredentialsSelector } from "../../../../credentials/store/selectors";
import { itwWalletInstanceAttestationSelector } from "../../../../walletInstance/store/selectors";
import { WIA_KEYTAG } from "../../../../common/utils/itwCryptoContextUtils";
import { assert } from "../../../../../../utils/assert";

/**
 * Select credentials to be used in a remote presentation and evaluated against a DQCL query.
 *
 * The Wallet Attestation in SD-JWT format is also included.
 */
export const itwRemotePresentationCredentialsSelector = createSelector(
  itwCredentialsSelector,
  itwWalletInstanceAttestationSelector,
  ({ eid, credentials }, walletAttestation) => {
    assert(O.isSome(eid), "Missing PID");
    const walletAttestationSdJwt = walletAttestation?.["dc+sd-jwt"];

    return [
      walletAttestationSdJwt && [WIA_KEYTAG, walletAttestationSdJwt],
      [eid.value.keyTag, eid.value.credential],
      ...credentials
        .filter(O.isSome)
        .map(c => [c.value.keyTag, c.value.credential] as [string, string])
    ].filter(Boolean) as Array<[string, string]>;
  }
);
