import { put, takeLatest } from "typed-redux-saga/macro";
import { itwFetchCredentialsCatalogue } from "../store/actions";
import { itwSetFiscalCodeWhitelisted } from "../../common/store/actions/preferences";
import { fetchCredentialsCatalogueSaga } from "./fetchCredentialsCatalogue";
import { fetchCatalogueTranslationsSaga } from "./fetchCatalogueTranslations";

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
