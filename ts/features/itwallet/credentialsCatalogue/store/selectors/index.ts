import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { constTrue, pipe } from "fp-ts/lib/function";
import { isAfter } from "date-fns";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import { DigitalCredentialMetadata } from "../../../common/utils/itwCredentialsCatalogueUtils";
import {
  getCredentialNameFromType,
  l2Credentials,
  newCredentials,
  upcomingCredentials
} from "../../../common/utils/itwCredentialUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";

export type CredentialsListEntry = {
  type: string;
  name: string;
};

const EMPTY_ARRAY: ReadonlyArray<CredentialsListEntry> = [];

/**
 * Hardcoded list of all obtainable credentials. When the credentials catalogue is not enabled,
 * this list is used as the source of truth for displaying credentials in the UI.
 */
const hardcodedCredentialsList: ReadonlyArray<CredentialsListEntry> = [
  ...l2Credentials,
  ...newCredentials,
  ...upcomingCredentials
].map(type => ({
  type,
  name: getCredentialNameFromType(type)
}));

/**
 * Select the last fetched credentials catalogue.
 * **Note:** the catalogue may be stale.
 */
export const itwCredentialsCatalogueSelector = (state: GlobalState) =>
  pot.toUndefined(state.features.itWallet.credentialsCatalogue.catalogue);

/**
 * Select whether the credentials catalogue is stale, i.e. the JWT is expired.
 *
 * Normally, the catalogue is fetched every 24 hours according to the `expires` HTTP header.
 * If the fetch fails, it is still possible to select the persisted catalogue, but it may be stale.
 */
export const itwIsCredentialsCatalogueStale = (state: GlobalState) =>
  pipe(
    itwCredentialsCatalogueSelector(state),
    O.fromNullable,
    O.map(catalogue => isAfter(new Date(), new Date(catalogue.exp * 1000))),
    O.getOrElse(constTrue)
  );

/**
 * Return a dictionary that maps each credential type to its metadata in the catalogue.
 */
export const itwCredentialsCatalogueByTypesSelector = createSelector(
  itwCredentialsCatalogueSelector,
  maybeCatalogue =>
    pipe(
      O.fromNullable(maybeCatalogue),
      O.map(catalogue =>
        catalogue.credentials.reduce(
          (acc, credential) => ({
            ...acc,
            [credential.credential_type]: credential
          }),
          {} as Record<string, DigitalCredentialMetadata>
        )
      ),
      O.toUndefined
    )
);

export const itwIsCredentialsCatalogueLoading = (state: GlobalState) =>
  pot.isLoading(state.features.itWallet.credentialsCatalogue.catalogue);

export const itwIsCredentialsCatalogueUnavailable = (state: GlobalState) =>
  pot.isNone(state.features.itWallet.credentialsCatalogue.catalogue);

/**
 * Return whether the list of obtainable credentials is built
 * from the catalogue and does not use hardcoded values.
 */
export const itwIsCatalogueEnabledForCredentialsList = (state: GlobalState) =>
  state.features.itWallet.credentialsCatalogue.isEnabledForCredentialsList;

/**
 * Select the list of all obtainable credentials that are available in the catalogue (if enabled),
 * or the hardcoded list otherwise. This list is not filtered any further: it includes all credentials.
 */
export const itwAvailableCredentialsListSelector = createSelector(
  [itwIsCatalogueEnabledForCredentialsList, itwCredentialsCatalogueSelector],
  (isEnabled, catalogue): ReadonlyArray<CredentialsListEntry> => {
    if (!isEnabled) {
      return hardcodedCredentialsList;
    }

    if (!catalogue) {
      return EMPTY_ARRAY;
    }
    return catalogue.credentials
      .filter(credential => credential.credential_type !== CredentialType.PID)
      .map(credential => ({
        name: credential.name,
        type: credential.credential_type
      }));
  }
);
