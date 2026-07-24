import { put, takeLatest } from "typed-redux-saga/macro";

import { itwSetFiscalCodeWhitelisted } from "../../common/store/actions/preferences";
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

  // The catalogue must be refreshed when the whitelist status changes, as this may change
  // the API version to use to fetch it. The request action is dispatched to trigger loading.
  yield* takeLatest(
    itwSetFiscalCodeWhitelisted,
    function* requestCredentialCatalogue() {
      yield* put(itwFetchCredentialsCatalogue.request());
    }
  );
}
