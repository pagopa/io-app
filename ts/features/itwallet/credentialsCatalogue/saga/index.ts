import { put, takeLatest } from "typed-redux-saga/macro";
import { itwFetchCredentialsCatalogue } from "../store/actions";
import { fetchCredentialsCatalogueSaga } from "./fetchCredentialsCatalogue";

export function* watchItwCredentialsCatalogueSaga() {
  yield* takeLatest(
    itwFetchCredentialsCatalogue.request,
    fetchCredentialsCatalogueSaga
  );

  // Fetch the catalogue immediately
  yield* put(itwFetchCredentialsCatalogue.request());
}
