import { createSelector } from "reselect";

import type { GlobalState } from "../../../../../../store/reducers/types";

import { getCredentialStatus } from "../../../../common/utils/itwCredentialStatusUtils";
import {
  CredentialFormat,
  CredentialMetadata,
  ItwJwtCredentialStatus,
  MdocSupportedCredentialConfiguration
} from "../../../../common/utils/itwTypesUtils";
import {
  itwCredentialsEidStatusSelector,
  makeSelectAllCredentials
} from "../../../../credentials/store/selectors";

type PresentableCredentialsByDocType = Record<string, CredentialMetadata>;

/**
 * Returns the credentials object from the itw credentials state. Only MDOC
 * credentials are returned.
 *
 * @param state - The global state.
 * @returns The credentials object.
 */
const itwCredentialsAsMdocSelector = makeSelectAllCredentials(
  CredentialFormat.MDOC
);

/**
 * Returns the credentials object by doc type. Only MDOC credentials are
 * returned.
 *
 * @param state - The global state.
 * @returns The credentials object by doc type.
 */
export const itwPresentableCredentialsByDocTypeSelector = createSelector(
  itwCredentialsAsMdocSelector,
  (credentials): Record<string, CredentialMetadata> =>
    Object.values(credentials).reduce<Record<string, CredentialMetadata>>(
      (acc, credential) => {
        const { credentialId, issuerConf } = credential;

        const { doctype } = issuerConf.credential_configurations_supported[
          credentialId
        ] as MdocSupportedCredentialConfiguration;

        return {
          ...acc,
          [doctype]: credential
        };
      },
      {}
    )
);

/** Checks if a given credential is expired based on its status. */
const isExpiredPresentableCredential = (credential: CredentialMetadata) => {
  const status = getCredentialStatus(credential);
  return status === "expired" || status === "jwtExpired";
};

/**
 * Checks if all presentable credentials are expired.
 *
 * @param presentableCredentialsByDocType - The presentable credentials by
 *   document type.
 * @returns `true` if all presentable credentials are expired, `false`
 *   otherwise.
 */
export const areAllPresentableCredentialsExpired = (
  presentableCredentialsByDocType: PresentableCredentialsByDocType
) => {
  const presentableCredentials = Object.values(presentableCredentialsByDocType);
  return (
    presentableCredentials.length > 0 &&
    presentableCredentials.every(isExpiredPresentableCredential)
  );
};

/**
 * Selector to determine whether there are any presentable credentials. Returns
 * `true` if there is at least one MDOC credential in the wallet.
 *
 * @param state - The global state.
 * @returns `true` if there is at least one presentable credential, `false`
 *   otherwise.
 */
export const hasPresentableCredentialsSelector = createSelector(
  itwPresentableCredentialsByDocTypeSelector,
  presentableCredentialsByDocType =>
    Object.keys(presentableCredentialsByDocType).length > 0
);

/**
 * Selector to determine whether the Proximity QR Code screen should surface the
 * expired credentials banner. Even when the PID and all presentable credentials
 * are expired, the wallet must still allow QR/NFC presentation so the relying
 * party can decide whether to accept the verification.
 *
 * @param state - The global state.
 * @returns `true` if the expired credentials banner should be shown.
 */
export const shouldShowExpiredProximityCredentialsBannerSelector =
  createSelector(
    itwCredentialsEidStatusSelector,
    itwPresentableCredentialsByDocTypeSelector,
    (
      pidStatus: ItwJwtCredentialStatus | undefined,
      presentableCredentialsByDocType
    ) =>
      pidStatus === "jwtExpired" &&
      areAllPresentableCredentialsExpired(presentableCredentialsByDocType)
  );

/**
 * Selector to determine whether a specific credential type is presentable.
 *
 * @param credentialType - The type of the credential to check.
 * @param state - The global state.
 * @returns Boolean indicating whether the specified credential type is
 *   presentable.
 */
export const isPresentableCredentialSelector =
  (credentialType: string) => (state: GlobalState) =>
    itwCredentialsAsMdocSelector(state)[credentialType] !== undefined;
