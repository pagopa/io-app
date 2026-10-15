import { call, put, select } from "typed-redux-saga/macro";

import { Locales } from "../../../../i18n";
import { persistedPreferencesSelector } from "../../../../store/reducers/persistedPreferences";
import { getNetworkError } from "../../../../utils/errors";
import { selectItwSpecsVersion } from "../../common/store/selectors/environment";
import { fetchCatalogueTranslations } from "../../common/utils/itwCredentialsCatalogueUtils";
import { itwFetchCatalogueTranslations } from "../store/actions";
import { itwCredentialsCatalogueSelector } from "../store/selectors";

/**
 * Fetch locale bundles for the Digital Credentials Catalogue.
 *
 * Translation support depends on the IT-Wallet spec version in use. The
 * underlying `fetchCatalogueTranslations` utility is a no-op (returns `{}`)
 * when the catalogue API does not expose a `fetchTranslations` method (e.g.
 * v1.0.0), so this saga is safe to run regardless of the active spec version.
 *
 * It is also a no-op when the catalogue has not yet been fetched.
 */
export function* fetchCatalogueTranslationsSaga() {
  const itwVersion = yield* select(selectItwSpecsVersion);
  const catalogue = yield* select(itwCredentialsCatalogueSelector);

  if (!catalogue) {
    return;
  }

  const preferences = yield* select(persistedPreferencesSelector);
  const locale: Locales = preferences.preferredLanguage ?? "it";

  yield* put(itwFetchCatalogueTranslations.request());

  try {
    const translations = yield* call(
      fetchCatalogueTranslations,
      itwVersion,
      catalogue,
      [locale]
    );
    yield* put(itwFetchCatalogueTranslations.success(translations));
  } catch (e) {
    yield* put(itwFetchCatalogueTranslations.failure(getNetworkError(e)));
  }
}
