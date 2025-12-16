import { call } from "typed-redux-saga/macro";
import { fetchCredentialsCatalogueSaga } from "./fetchCredentialsCatalogue";

export function* watchItwCredentialsCatalogueSaga() {
  yield* call(fetchCredentialsCatalogueSaga);
}
