import { put, takeLatest } from "typed-redux-saga/macro";

import { itwFetchCredentialsCatalogue } from "../store/actions";
import { fetchCatalogueTranslationsSaga } from "./fetchCatalogueTranslations";
import { fetchCredentialsCatalogueSaga } from "./fetchCredentialsCatalogue";

export function* watchItwCredentialsCatalogueSaga() {
  yield* takeLatest(
    itwFetchCredentialsCatalogue.request,
    fetchCredentialsCatalogueSaga
  );

  // Fetch translations whenever the catalogue is successfully refreshed
  yield* takeLatest(
    itwFetchCredentialsCatalogue.success,
    fetchCatalogueTranslationsSaga
  );

  // Fetch the catalogue immediately
  yield* put(itwFetchCredentialsCatalogue.request());
}
