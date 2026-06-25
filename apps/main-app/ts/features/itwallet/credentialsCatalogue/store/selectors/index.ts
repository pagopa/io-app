import * as pot from "@pagopa/ts-commons/lib/pot";
import * as O from "fp-ts/lib/Option";
import { constTrue, pipe } from "fp-ts/lib/function";
import { isAfter } from "date-fns";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  DigitalCredentialMetadata,
  DigitalCredentialsCatalogue
} from "../../../common/utils/itwCredentialsCatalogueUtils";
import {
  getCredentialNameFromType,
  l2Credentials,
  newCredentials,
  upcomingCredentials
} from "../../../common/utils/itwCredentialUtils";
import { itwLifecycleIsITWalletValidSelector } from "../../../lifecycle/store/selectors";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { Locales } from "../../../../../i18n";
import { persistedPreferencesSelector } from "../../../../../store/reducers/persistedPreferences";
import {
  itwHiddenCredentialsSelector,
  itwNewCredentialsSelector,
  itwPinnedCredentialsSelector
} from "../../../common/store/selectors/remoteConfig";

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
 * Select the last fetched credentials catalogue. **Note:** the catalogue may be stale.
 *
 * The catalogue credentials are mapped to replace the legacy "PersonIdentificationData" credential type with the new "pid".
 * This ensures the PID can always be identified with the same type, avoiding the need to keep separate values for the same credential.
 *
 * The original credential_type can still be found in the raw persisted catalogue, before any transformation.
 */
export const itwCredentialsCatalogueSelector = createSelector(
  (state: GlobalState) =>
    state.features.itWallet.credentialsCatalogue.catalogue,
  (cataloguePot): DigitalCredentialsCatalogue | undefined => {
    const mappedCatalogue = pot.map(cataloguePot, catalogue => ({
      ...catalogue,
      credentials: catalogue.credentials.map(credential => ({
        ...credential,
        credential_type:
          credential.credential_type === "PersonIdentificationData"
            ? CredentialType.PID
            : credential.credential_type
      }))
    }));
    return pot.toUndefined(mappedCatalogue);
  }
);

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
 * Select the raw catalogue translations pot (all locales).
 * Only populated for IT-Wallet spec v1.3.3.
 */
export const itwCatalogueTranslationsSelector = (state: GlobalState) => {
  const translations =
    state.features.itWallet.credentialsCatalogue.translations;
  // Guard against missing field in persisted state from app versions
  // prior to migration 13 (before catalogue translations were introduced).
  if (!translations) {
    return undefined;
  }
  return pot.toUndefined(translations);
};

/**
 * Select the catalogue translations for the current app locale.
 * Returns a flat `l10n_id → string` map, or `undefined` when unavailable.
 */
export const itwCatalogueTranslationsByLocaleSelector = createSelector(
  [itwCatalogueTranslationsSelector, persistedPreferencesSelector],
  (translations, preferences): Record<string, string> | undefined => {
    if (!translations) {
      return undefined;
    }
    const locale: Locales = preferences.preferredLanguage ?? "it";
    return translations[locale];
  }
);

/**
 * Returns a resolver function that resolves a credential display name.
 * When the credentials catalogue feature flag is enabled, names are resolved using
 * catalogue translations (v1.3.3+) when available, falling back to the catalogue
 * static name. When the FF is disabled, always falls back to the hardcoded i18n string.
 *
 * This is the single source of truth for credential name resolution across the app.
 * Use `useItwCredentialName` hook for component use, or call this selector directly
 * when resolving names for multiple credential types at once.
 */
export const itwCredentialNameResolverSelector = createSelector(
  [
    itwIsCatalogueEnabledForCredentialsList,
    itwCredentialsCatalogueByTypesSelector,
    itwCatalogueTranslationsByLocaleSelector,
    itwLifecycleIsITWalletValidSelector
  ],
  (isCatalogueEnabled, catalogue, translations, withL3Design) =>
    (credentialType: string | undefined, withDefault: string = ""): string => {
      if (isCatalogueEnabled && credentialType && catalogue && translations) {
        const catalogueMeta = catalogue[credentialType];
        const resolvedName =
          (catalogueMeta.name_l10n_id &&
            translations[catalogueMeta.name_l10n_id]) ||
          catalogueMeta.name;
        if (resolvedName) {
          return resolvedName;
        }
      }
      return getCredentialNameFromType(
        credentialType,
        withL3Design,
        withDefault
      );
    }
);

/**
 * Select the list of all obtainable credentials that are available in the catalogue (if enabled),
 * or the hardcoded list otherwise.
 *
 * When the catalogue is enabled, credentials are ordered and filtered according to remote config:
 * - Credentials in `hidden_credentials` are excluded.
 * - Credentials in `new_credentials` appear first (in array order).
 * - Credentials in `pinned_credentials` (not already new) appear next (in array order).
 * - Remaining credentials follow default order.
 */
export const itwAvailableCredentialsListSelector = createSelector(
  [
    itwIsCatalogueEnabledForCredentialsList,
    itwCredentialsCatalogueSelector,
    itwCredentialNameResolverSelector,
    itwPinnedCredentialsSelector,
    itwNewCredentialsSelector,
    itwHiddenCredentialsSelector
  ],
  (
    isEnabled,
    catalogue,
    resolveName,
    pinnedCredentials,
    remoteNewCredentials,
    hiddenCredentials
  ): ReadonlyArray<CredentialsListEntry> => {
    if (!isEnabled) {
      return hardcodedCredentialsList;
    }

    if (!catalogue) {
      return EMPTY_ARRAY;
    }

    const entries: ReadonlyArray<CredentialsListEntry> = catalogue.credentials
      .filter(
        credential =>
          credential.credential_type !== CredentialType.PID &&
          !hiddenCredentials.includes(credential.credential_type)
      )
      .map(credential => ({
        name: resolveName(
          credential.credential_type,
          credential.name ?? credential.credential_type
        ),
        type: credential.credential_type
      }));

    const newEntries = remoteNewCredentials
      .map(type => entries.find(e => e.type === type))
      .filter((e): e is CredentialsListEntry => e !== undefined);

    const pinnedEntries = pinnedCredentials
      .filter(type => !remoteNewCredentials.includes(type))
      .map(type => entries.find(e => e.type === type))
      .filter((e): e is CredentialsListEntry => e !== undefined);

    const restEntries = entries.filter(
      e =>
        !remoteNewCredentials.includes(e.type) &&
        !pinnedCredentials.includes(e.type)
    );

    return [...newEntries, ...pinnedEntries, ...restEntries];
  }
);
