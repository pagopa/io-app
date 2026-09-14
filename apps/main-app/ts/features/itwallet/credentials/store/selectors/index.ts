import _, { partition } from "lodash";
import { createSelector } from "reselect";

import { GlobalState } from "../../../../../store/reducers/types";
import {
  getFamilyNameFromCredential,
  getFirstNameFromCredential,
  getFiscalCodeFromCredential
} from "../../../common/utils/itwClaimsUtils";
import { shouldRefillBatch } from "../../../common/utils/itwCredentialIssuanceUtils";
import { getCredentialStatus } from "../../../common/utils/itwCredentialStatusUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  CredentialFormat,
  CredentialMetadata,
  ItwJwtCredentialStatus
} from "../../../common/utils/itwTypesUtils";
import { DISPLAY_FORMAT_PRIORITY } from "../../utils/format";

type CredentialsByType = {
  [K: string]: Record<CredentialFormat, CredentialMetadata>;
};

/**
 * Resolves the credential to display for a given format.
 *
 * When the requested format is SD-JWT (the default for display), it falls back to the other
 * formats following {@link DISPLAY_FORMAT_PRIORITY}, so that credentials issued only as mDoc
 * (e.g. proof of age) are still resolved.
 *
 * For any other requested format the exact format is returned, with no fallback.
 */
const withDisplayFormatFallback = (
  credential: CredentialsByType[string] | undefined,
  format: CredentialFormat
) => {
  if (format === CredentialFormat.SD_JWT) {
    return DISPLAY_FORMAT_PRIORITY.reduce<CredentialMetadata | undefined>(
      (acc, f) => acc ?? credential?.[f],
      undefined
    );
  }
  return credential?.[format];
};

/**
 * Returns all stored credentials as a flat list. A batch credential is a single entry that lists
 * all its copies' keyTags in `keyTags` (see {@link CredentialMetadata}).
 *
 * @param state - The global state.
 * @returns The flat list of all stored credentials
 */
export const itwAllStoredCredentialsSelector = createSelector(
  (state: GlobalState) => state.features.itWallet.credentials.credentials,
  (credentials): ReadonlyArray<CredentialMetadata> => Object.values(credentials)
);

/**
 * Aggregate credentials by type to get the same credential with all its formats.
 *
 * @param state - The global state.
 * @returns The credentials object grouped by type
 */
export const itwCredentialsByTypeSelector = createSelector(
  itwAllStoredCredentialsSelector,
  credentials =>
    credentials.reduce<CredentialsByType>(
      (acc, c) => ({
        ...acc,
        [c.credentialType]: { ...acc[c.credentialType], [c.format]: c }
      }),
      {}
    )
);

/**
 * Creates a memoized selector to retrieve all credentials of a specific format.
 *
 * @param format - The credential format
 * @returns The credentials object.
 */
export const makeSelectAllCredentials = (format: CredentialFormat) =>
  createSelector(itwCredentialsByTypeSelector, credentials =>
    Object.values(credentials)
      .map(c => withDisplayFormatFallback(c, format))
      .reduce<Record<string, CredentialMetadata>>(
        (acc, c) => (c ? { ...acc, [c.credentialType]: c } : acc),
        {}
      )
  );

/**
 * Returns the credentials object from the itw credentials state, including the PID credential.
 * SD-JWT credentials are preferred; credentials available only as mDoc fall back to that format.
 *
 * @param state - The global state.
 * @returns The credentials object.
 */
export const itwCredentialsAllSelector = makeSelectAllCredentials(
  CredentialFormat.SD_JWT
);

/**
 * Returns the credentials object from the itw credentials state, excluding the PID credential.
 * SD-JWT credentials are preferred; credentials available only as mDoc fall back to that format.
 *
 * @param state - The global state.
 * @returns The credentials object.
 */
export const itwCredentialsSelector = createSelector(
  itwCredentialsAllSelector,
  ({ [CredentialType.PID]: _pid, ...otherCredentials }) => otherCredentials
);

/**
 * Convenience selector that returns the eID credential from the credentials object.
 *
 * @param state - The global state.
 * @returns The eID credential, or `undefined` when the wallet does not contain one.
 */
export const itwCredentialsEidSelector = createSelector(
  itwCredentialsByTypeSelector,
  ({ [CredentialType.PID]: pid }) =>
    withDisplayFormatFallback(pid, CredentialFormat.SD_JWT)
);

/**
 * Given a credential key, returns the credential of the given type from the credentials object.
 *
 * @param type - The credential type.
 * @param format - The credential format (default to SD-JWT).
 * @returns The credential, or `undefined` when the wallet does not contain one.
 */
export const itwCredentialSelector = (
  key: string,
  format = CredentialFormat.SD_JWT
) =>
  createSelector(itwCredentialsByTypeSelector, credentials =>
    withDisplayFormatFallback(credentials[key], format)
  );

/**
 * Returns the list of unique types of credentials contained in the credentials object.
 *
 * @param state - The global state.
 * @returns The types of the credentials.
 */
export const itwCredentialsTypesSelector = createSelector(
  itwCredentialsSelector,
  credentials =>
    Array.from(new Set(Object.values(credentials).map(c => c.credentialType)))
);

/**
 * Returns the fiscal code from the stored eID.
 *
 * @param state - The global state.
 * @returns The fiscal code.
 */
export const selectFiscalCodeFromEid = createSelector(
  itwCredentialsEidSelector,
  eid => (eid ? getFiscalCodeFromCredential(eid) : "")
);

/**
 * Returns the name and surname from the stored eID.
 *
 * @param state - The global state.
 * @returns The name and surname.
 */
export const selectNameSurnameFromEid = createSelector(
  itwCredentialsEidSelector,
  eid => {
    if (!eid) {
      return "";
    }
    const firstName = _.capitalize(getFirstNameFromCredential(eid));
    const familyName = _.capitalize(getFamilyNameFromCredential(eid));
    return `${firstName} ${familyName}`.trim();
  }
);

/**
 * Returns the number of credentials in the credentials object, excluding the eID credential.
 *
 * @param state - The global state.
 * @returns The number of credentials.
 */
const itwCredentialsSizeSelector = createSelector(
  itwCredentialsSelector,
  credentials => Object.keys(credentials).length
);

/**
 * Returns whether the wallet is empty, i.e. it does not have any credential.
 * The eID is not considered, only other (Q)EAAs.
 *
 * Note: this selector does not check the wallet validity.
 *
 * @param state - The global state.
 * @returns Whether the wallet is empty.
 */
export const itwIsWalletEmptySelector = createSelector(
  itwCredentialsSizeSelector,
  size => size === 0
);

/**
 * Returns whether the wallet has at least 2 credentials.
 * The eID is not considered, only other (Q)EAAs.
 *
 * Note: this selector does not check the wallet validity.
 *
 * @param state - The global state.
 * @returns Whether the wallet has at least 2 credentials.
 */
export const itwHasWalletAtLeastTwoCredentialsSelector = createSelector(
  itwCredentialsSizeSelector,
  size => size >= 2
);

/**
 * Get the credential status corresponding to the status list/status assertion error, if present.
 *
 * Note: the credential type is passed as second argument to reuse the same selector and cache per credential type.
 *
 * @param state - The global state.
 * @param type - The credential type.
 * @returns The credential status corresponding to the status assertion error, if present.
 */
export const itwCredentialStatusSelector = createSelector(
  itwCredentialsSelector,
  (_state: GlobalState, type: string) => type,
  (credentials, type) => {
    // This should never happen
    if (credentials[type] === undefined) {
      return { status: undefined };
    }

    return { status: getCredentialStatus(credentials[type]) };
  }
);

/**
 * Returns the credential status for the eID.
 *
 * Note that this status is determined only by the SD-JWT credential, and does not use status assertion/status list.
 *
 * @param state - The global state.
 * @returns The eID's JWT status.
 */
export const itwCredentialsEidStatusSelector = createSelector(
  itwCredentialsEidSelector,
  eid =>
    // eID does not have status assertion nor expiry date, so it safe to assume its status is based on the JWT only
    eid ? (getCredentialStatus(eid) as ItwJwtCredentialStatus) : undefined
);

/**
 * Returns the eID credential expiration date, if present.
 *
 * @param state - The global state.
 * @returns The eID credential expiration date.
 */
export const itwCredentialsEidExpirationSelector = createSelector(
  itwCredentialsEidSelector,
  eid => eid?.jwt.expiration
);

/**
 * Returns the eID credential issued at date, if present.
 *
 * @param state - The global state.
 * @returns The eID credential issued at date.
 */
export const itwCredentialsEidIssuedAtSelector = createSelector(
  itwCredentialsEidSelector,
  eid => eid?.jwt.issuedAt
);

/**
 * Returns all stored credential instances of the given type, in every format. Unlike the
 * representative-based selectors, this reads the raw store so it includes every copy of a
 * credential obtained in batch. Used for clean up operations and batch consumption.
 *
 * @param key The type of credential
 * @returns A list of CredentialMetadata
 */
export const itwCredentialsListByTypeSelector = (key: string) =>
  createSelector(
    itwAllStoredCredentialsSelector,
    (credentials): ReadonlyArray<CredentialMetadata> =>
      credentials.filter(c => c.credentialType === key)
  );

/**
 * Returns the types of the one-time-use credentials that are down to their refill threshold.
 *
 * Types are deduplicated: the same credential may be stored in multiple formats, but it is
 * renewed once for all of them.
 */
export const itwCredentialsToRefillSelector = createSelector(
  itwAllStoredCredentialsSelector,
  (credentials): ReadonlyArray<string> =>
    Array.from(
      new Set(credentials.filter(shouldRefillBatch).map(c => c.credentialType))
    )
);

/**
 * Convenience selector that returns true if the user has a mDL credential stored.
 *
 * @param state - The global state.
 * @returns Whether the user has a mDL credential.
 */
export const itwIsMdlPresentSelector = createSelector(
  itwCredentialsByTypeSelector,
  credentials => credentials.mDL !== undefined
);

/**
 * Split a given list of credential with types into obtained / notObtained
 * obtained = present in wallet
 */
export const makeItwCredentialsByPresenceSelector = <
  T extends { type: string }
>(
  credentials: ReadonlyArray<T>
) =>
  createSelector(itwCredentialsByTypeSelector, credentialsByType => {
    const [obtained, notObtained] = partition(
      credentials,
      ({ type }) => credentialsByType[type] !== undefined
    );
    return { obtained, notObtained };
  });
