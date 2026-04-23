import { call, put, select } from "typed-redux-saga/macro";
import { persistedPreferencesSelector } from "../../../../store/reducers/persistedPreferences";
import { Locales } from "../../../../i18n";
import { getNetworkError } from "../../../../utils/errors";
import { selectItwSpecsVersion } from "../../common/store/selectors/environment";
import { fetchCatalogueTranslations } from "../../common/utils/itwCredentialsCatalogueUtils";
import { itwFetchCatalogueTranslations } from "../store/actions";
import { itwCredentialsCatalogueSelector } from "../store/selectors";

/**
 * Fetch locale bundles for the Digital Credentials Catalogue.
 *
 * This saga is a no-op for IT-Wallet spec v1.0.0 ("Documenti su IO"), since
 * translation support was introduced in v1.3.3. It is also a no-op when the
 * catalogue has not yet been fetched or carries no localization metadata.
 */
export function* fetchCatalogueTranslationsSaga() {
  const itwVersion = yield* select(selectItwSpecsVersion);

  if (itwVersion !== "1.3.3") {
    return;
  }

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
