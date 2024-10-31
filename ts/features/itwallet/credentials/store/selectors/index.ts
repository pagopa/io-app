import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { pipe } from "fp-ts/lib/function";
import { Errors } from "@pagopa/io-react-native-wallet";
import { GlobalState } from "../../../../../store/reducers/types";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  ItwJwtCredentialStatus,
  StoredCredential
} from "../../../common/utils/itwTypesUtils";
import {
  getCredentialStatus,
  getFiscalCodeFromCredential
} from "../../../common/utils/itwClaimsUtils";

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
  createSelector(
    itwCredentialsByTypeSelector,
    credentials => credentials[type] || O.none
  );

export const itwCredentialsTypesSelector = createSelector(
  itwCredentialsByTypeSelector,
  credentials => Object.keys(credentials)
);

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
 */
export const itwCredentialStatusSelector = (type: string) =>
  createSelector(itwCredentialByTypeSelector(type), credentialOption => {
    // This should never happen
    if (O.isNone(credentialOption)) {
      return { status: undefined, message: undefined };
    }

    const { storedStatusAttestation, issuerConf, credentialType } =
      credentialOption.value;

    const errorCode =
      storedStatusAttestation?.credentialStatus === "invalid"
        ? storedStatusAttestation.errorCode
        : undefined;

    return {
      status: getCredentialStatus(credentialOption.value),
      message: errorCode
        ? Errors.extractErrorMessageFromIssuerConf(errorCode, {
            issuerConf,
            credentialType
          })
        : undefined
    };
  });

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
