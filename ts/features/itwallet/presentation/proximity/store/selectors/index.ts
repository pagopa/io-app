import { createSelector } from "reselect";
import { getCredentialStatus } from "../../../../common/utils/itwCredentialStatusUtils";
import {
  itwCredentialsEidStatusSelector,
  makeSelectAllCredentials
} from "../../../../credentials/store/selectors";
import {
  CredentialFormat,
  ItwJwtCredentialStatus,
  MdocSupportedCredentialConfiguration,
  StoredCredential
} from "../../../../common/utils/itwTypesUtils";

type PresentableCredentialsByDocType = Record<string, StoredCredential>;

/**
 * Returns the credentials object from the itw credentials state.
 * Only MDOC credentials are returned.
 *
 * @param state - The global state.
 * @returns The credentials object.
 */
const itwCredentialsAsMdocSelector = makeSelectAllCredentials(
  CredentialFormat.MDOC
);

/**
 * Returns the credentials object by doc type.
 * Only MDOC credentials are returned.
 *
 * @param state - The global state.
 * @returns The credentials object by doc type.
 */
export const itwPresentableCredentialsByDocTypeSelector = createSelector(
  itwCredentialsAsMdocSelector,
  (credentials): Record<string, StoredCredential> =>
    Object.values(credentials).reduce<Record<string, StoredCredential>>(
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

/**
 * Checks if a given credential is expired based on its status.
 */
const isExpiredPresentableCredential = (credential: StoredCredential) => {
  const status = getCredentialStatus(credential);
  return status === "expired" || status === "jwtExpired";
};

/**
 * Checks if all presentable credentials are expired.
 * @param presentableCredentialsByDocType - The presentable credentials by document type.
 * @returns `true` if all presentable credentials are expired, `false` otherwise.
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
 * Selector to determine whether the Proximity QR Code Selector should be blocked.
 * It should be blocked if the PID credential is expired and all presentable credentials are expired.
 *
 * @param state - The global state.
 * @returns `true` if the Proximity QR Code Selector should be blocked, `false` otherwise.
 */
export const shouldBlockProximityQrCodeSelector = createSelector(
  itwCredentialsEidStatusSelector,
  itwPresentableCredentialsByDocTypeSelector,
  (
    pidStatus: ItwJwtCredentialStatus | undefined,
    presentableCredentialsByDocType
  ) =>
    pidStatus === "jwtExpired" &&
    areAllPresentableCredentialsExpired(presentableCredentialsByDocType)
);
