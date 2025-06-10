import * as pot from "@pagopa/ts-commons/lib/pot";
import { GlobalState } from "../../../../../store/reducers/types";
import { type WiaFormat } from "../../../common/utils/itwTypesUtils";

/**
 * Selector to get the wallet instance attestation
 * @version 0.7.1
 *
 * @deprecated Use {@link itwWalletInstanceAttestationJwtSelector} instead
 */
export const itwWalletInstanceAttestationSelector = (state: GlobalState) =>
  state.features.itWallet.walletInstance.attestation;

/* Selector to get the wallet instance status */
export const itwWalletInstanceStatusSelector = (state: GlobalState) =>
  pot.toUndefined(state.features.itWallet.walletInstance.status);

/**
 * Returns true when it was not possible to retrieve the wallet instance status because of unexpected errors,
 * hence we cannot know whether the wallet instance is valid or has been revoked.
 */
export const itwIsWalletInstanceStatusFailureSelector = (state: GlobalState) =>
  pot.isError(state.features.itWallet.walletInstance.status);

/**
 * Selector to get the Wallet Attestation in the given format
 */
const itwMakeWalletInstanceAttestationSelector =
  (format: WiaFormat) => (state: GlobalState) =>
    state.features.itWallet.walletInstance.walletAttestation?.[format];

/**
 * Selector to get the Wallet Attestation in JWT format
 * @version 1.0
 */
export const itwWalletInstanceAttestationJwtSelector =
  itwMakeWalletInstanceAttestationSelector("jwt");

/**
 * Selector to get the Wallet Attestation in SD-JWT format
 * @version 1.0
 */
export const itwWalletInstanceAttestationSdJwtSelector =
  itwMakeWalletInstanceAttestationSelector("dc+sd-jwt");
/**
 * Selector to get the Wallet Attestation in MDOC CBOR format
 * @version 1.0
 */
export const itwWalletInstanceAttestationMdocSelector =
  itwMakeWalletInstanceAttestationSelector("mso_mdoc");
