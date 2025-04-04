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
  ItwJwtCredentialStatus,
  StoredCredential
} from "../../../common/utils/itwTypesUtils";

export const itwCredentialsSelector = (state: GlobalState) =>
  state.features.itWallet.credentials;

export const itwCredentialsEidSelector = (state: GlobalState) =>
  state.features.itWallet.credentials.eid;

export const itwCredentialsByTypeSelector = createSelector(
  itwCredentialsSelector,
  ({ eid, credentials }) =>
    ({
      [CredentialType.PID]: eid,
      ...credentials.reduce((acc, credentialOption) => {
        if (O.isSome(credentialOption)) {
          return {
            ...acc,
            [credentialOption.value.credentialType]: credentialOption
          };
        }
        return acc;
      }, {} as { [type: string]: O.Option<StoredCredential> })
    } as { [type: string]: O.Option<StoredCredential> })
);

export const itwCredentialByTypeSelector = (type: string) =>
  createSelector(itwCredentialsByTypeSelector, credentials =>
    pipe(credentials[type], O.fromNullable, O.flatten)
  );

export const itwCredentialsTypesSelector = createSelector(
  itwCredentialsByTypeSelector,
  credentials => Object.keys(credentials)
);

/**
 * Returns the fiscal code from the stored eID.
 */
export const selectFiscalCodeFromEid = createSelector(
  itwCredentialsSelector,
  credentials =>
    pipe(
      credentials.eid,
      O.map(getFiscalCodeFromCredential),
      O.getOrElse(() => "")
    )
);

/**
 * Returns the name and surname from the stored eID.
 */
export const selectNameSurnameFromEid = createSelector(
  itwCredentialsSelector,
  credentials =>
    pipe(
      credentials.eid,
      O.map(getFirstNameFromCredential),
      O.chain(firstName =>
        pipe(
          credentials.eid,
          O.map(getFamilyNameFromCredential),
          O.map(
            familyName =>
              `${_.capitalize(firstName)} ${_.capitalize(familyName)}`
          )
        )
      ),
      O.getOrElse(() => "")
    )
);

/**
 * Returns whether the wallet is empty, i.e. it does not have any credential.
 * The eID is not considered, only other (Q)EAAs.
 *
 * Note: this selector does not check the wallet validity.
 */
export const itwIsWalletEmptySelector = createSelector(
  itwCredentialsSelector,
  ({ credentials }) => credentials.length === 0
);

/**
 * Get the credential status and the error message corresponding to the status attestation error, if present.
 * The message is dynamic and extracted from the issuer configuration.
 *
 * Note: the credential type is passed as second argument to reuse the same selector and cache per credential type.
 */
export const itwCredentialStatusSelector = createSelector(
  itwCredentialsByTypeSelector,
  (_state: GlobalState, type: string) => type,
  (credentials, type) => {
    const credentialOption = credentials[type] || O.none;

    // This should never happen
    if (O.isNone(credentialOption)) {
      return { status: undefined, message: undefined };
    }

    return getCredentialStatusObject(credentialOption.value);
  }
);

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
