import * as O from "fp-ts/lib/Option";
import { put } from "typed-redux-saga/macro";
import { ItwCredentialsMocks } from "../../__mocks__/credentials";
import { itwIssuanceEid } from "../store/actions/eid";

export function* handleItwIssuanceEidSaga() {
  // Mocked return value
  yield* put(itwIssuanceEid.success(O.some(ItwCredentialsMocks.eid)));
}
