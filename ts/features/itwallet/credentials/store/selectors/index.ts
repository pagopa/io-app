import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";
import _ from "lodash";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  getFamilyNameFromCredential,
  getFirstNameFromCredential,
  getFiscalCodeFromCredential
} from "../../../common/utils/itwClaimsUtils";
import {
  getCredentialStatus,
  getCredentialStatusObject
} from "../../../common/utils/itwCredentialStatusUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  CredentialFormat,
  ItwJwtCredentialStatus,
  StoredCredential
} from "../../../common/utils/itwTypesUtils";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";

type CredentialsByType = {
  [K: string]: Record<CredentialFormat, StoredCredential>;
};

/**
 * The Wallet might contain older credentials in `vc+sd-jwt` format.
 * We must ensure credentials selectors still work with the older format.
 */
const withLegacyFallback = (
  credential: CredentialsByType[string] | undefined,
  format: CredentialFormat
) => {
  if (format === CredentialFormat.SD_JWT) {
    return credential?.[format] ?? credential?.[CredentialFormat.LEGACY_SD_JWT];
  }
  return credential?.[format];
};

/**
 * Aggregate credentials by type to get the same credential with all its formats
 *
 * @param state - The global state.
 * @returns The credentials object grouped by type
 */
export const itwCredentialsByTypeSelector = createSelector(
  (state: GlobalState) => state.features.itWallet.credentials.credentials,
  credentials =>
    Object.values(credentials).reduce<CredentialsByType>(
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
      .map(c => withLegacyFallback(c, format))
      .reduce<Record<string, StoredCredential>>(
        (acc, c) => (c ? { ...acc, [c.credentialType]: c } : acc),
        {}
      )
  );

/**
 * Returns the credentials object from the itw credentials state, including the PID credential.
 * Only SD-JWT credentials are returned.
 *
 * @param state - The global state.
 * @returns The credentials object.
 */
export const itwCredentialsAllSelector = makeSelectAllCredentials(
  CredentialFormat.SD_JWT
);

/**
 * Returns the credentials object from the itw credentials state, excluding the PID credential.
 * Only SD-JWT credentials are returned.
 *
 * @param state - The global state.
 * @returns The credentials object.
 */
export const itwCredentialsSelector = createSelector(
  itwCredentialsAllSelector,
  ({ [CredentialType.PID]: _pid, ...otherCredentials }) => otherCredentials
);

/**
 * Convenience selector that returns an Option containing the eID credential from the credentials object.
 *
 * @param state - The global state.
 * @returns The eID credential Option
 */
export const itwCredentialsEidSelector = createSelector(
  itwCredentialsByTypeSelector,
  ({ [CredentialType.PID]: pid }) =>
    O.fromNullable(withLegacyFallback(pid, CredentialFormat.SD_JWT))
);

/**
 * Given a credential key, returns an Option containing the credential of the given type from the credentials object.
 *
 * @param type - The credential type.
 * @param format - The credential format (default to SD-JWT).
 * @returns The credential Option.
 */
export const itwCredentialSelector = (
  key: string,
  format = CredentialFormat.SD_JWT
) =>
  createSelector(itwCredentialsByTypeSelector, credentials =>
    O.fromNullable(withLegacyFallback(credentials[key], format))
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
  eid =>
    pipe(
      eid,
      O.map(getFiscalCodeFromCredential),
      O.getOrElse(() => "")
    )
);

/**
 * Returns the name and surname from the stored eID.
 *
 * @param state - The global state.
 * @returns The name and surname.
 */
export const selectNameSurnameFromEid = createSelector(
  itwCredentialsEidSelector,
  eid =>
    pipe(
      eid,
      O.map(getFirstNameFromCredential),
      O.chain(firstName =>
        pipe(
          eid,
          O.map(getFamilyNameFromCredential),
          O.map(familyName =>
            `${_.capitalize(firstName)} ${_.capitalize(familyName)}`.trim()
          )
        )
      ),
      O.getOrElse(() => "")
    )
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
 * Get the credential status and the error message corresponding to the status assertion error, if present.
 * The message is dynamic and extracted from the issuer configuration.
 *
 * Note: the credential type is passed as second argument to reuse the same selector and cache per credential type.
 *
 * @param state - The global state.
 * @param type - The credential type.
 * @returns The credential status and the error message corresponding to the status assertion error, if present.
 */
export const itwCredentialStatusSelector = createSelector(
  itwCredentialsSelector,
  (_state: GlobalState, type: string) => type,
  (credentials, type) => {
    // This should never happen
    if (credentials[type] === undefined) {
      return { status: undefined, message: undefined };
    }

    return getCredentialStatusObject(credentials[type]);
  }
);

/**
 * Returns the credential status and the error message corresponding to the status assertion error, if present.
 *
 * @param state - The global state.
 * @returns The credential status and the error message corresponding to the status assertion error, if present.
 */
export const itwCredentialsEidStatusSelector = createSelector(
  itwCredentialsEidSelector,
  eidOption =>
    pipe(
      eidOption,
      // eID does not have status assertion nor expiry date, so it safe to assume its status is based on the JWT only
      O.map(eid => getCredentialStatus(eid) as ItwJwtCredentialStatus),
      O.toUndefined
    )
);

/**
 * Returns true if the eID is present and its status is "jwtExpired" or "jwtExpiring".
 * Ignore the PID by checking that IT Wallet is not enabled.
 */
export const itwIsEidExpiredOrExpiringSelector = createSelector(
  [
    itwCredentialsEidStatusSelector,
    (state: GlobalState) => itwLifecycleIsITWalletValidSelector(state)
  ],
  (eidStatus, isITWalletValid) => {
    if (isITWalletValid) return false;
    return eidStatus === "jwtExpired" || eidStatus === "jwtExpiring";
  }
);

/**
 * Return a list of all credentials of the same type, mainly used for clean up operations.
 * @param key The type of credential
 * @returns A list of StoredCredential
 */
export const itwCredentialsListByTypeSelector = (key: string) =>
  createSelector(itwCredentialsByTypeSelector, credentials =>
    pipe(
      O.fromNullable(credentials[key]),
      O.map(Object.values),
      O.getOrElse<ReadonlyArray<StoredCredential>>(() => [])
    )
  );
