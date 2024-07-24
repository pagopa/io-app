import * as O from "fp-ts/lib/Option";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";

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
