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
import { ItwJwtCredentialStatus } from "../../../common/utils/itwTypesUtils";

/**
 * Returns an Option containing the eID credential from the credentials object.
 *
 * @param state - The global state.
 * @returns The eID credential Option
 */
export const itwCredentialsEidSelector = createSelector(
  (state: GlobalState) => state.features.itWallet.credentials.credentials,
  ({ [CredentialType.PID]: pid }) => O.fromNullable(pid)
);

/**
 * Returns the credentials object from the itw credentials state, excluding the eID credential.
 *
 * @param state - The global state.
 * @returns The credentials object.
 */
export const itwCredentialsSelector = createSelector(
  (state: GlobalState) => state.features.itWallet.credentials.credentials,
  ({ [CredentialType.PID]: pid, ...otherCredentials }) => otherCredentials
);

/**
 * Returns an Option containing the credential of the given type from the credentials object.
 *
 * @param type - The credential type.
 * @returns The credential Option.
 */
export const itwCredentialByTypeSelector = (type: string) =>
  createSelector(itwCredentialsSelector, credentials =>
    O.fromNullable(credentials[type])
  );

/**
 * Returns the types of the credentials in the credentials object, excluding the eID credential.
 *
 * @param state - The global state.
 * @returns The types of the credentials.
 */
export const itwCredentialsTypesSelector = createSelector(
  itwCredentialsSelector,
  credentials => Object.keys(credentials)
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
 * Get the credential status and the error message corresponding to the status attestation error, if present.
 * The message is dynamic and extracted from the issuer configuration.
 *
 * Note: the credential type is passed as second argument to reuse the same selector and cache per credential type.
 *
 * @param state - The global state.
 * @param type - The credential type.
 * @returns The credential status and the error message corresponding to the status attestation error, if present.
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
 * Returns the credential status and the error message corresponding to the status attestation error, if present.
 *
 * @param state - The global state.
 * @returns The credential status and the error message corresponding to the status attestation error, if present.
 */
export const itwCredentialsEidStatusSelector = createSelector(
  itwCredentialsEidSelector,
  eidOption =>
    pipe(
      eidOption,
      // eID does not have status attestation nor expiry date, so it safe to assume its status is based on the JWT only
      O.map(eid => getCredentialStatus(eid) as ItwJwtCredentialStatus),
      O.toUndefined
    )
);
