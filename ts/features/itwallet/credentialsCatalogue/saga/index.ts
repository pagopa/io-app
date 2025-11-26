import { call, select } from "typed-redux-saga/macro";
import { itwIsL3EnabledSelector } from "../../common/store/selectors/preferences";
import { fetchCredentialsCatalogueSaga } from "./fetchCredentialsCatalogue";

export function* watchItwCredentialsCatalogueSaga() {
  const isItwEnabled = yield* select(itwIsL3EnabledSelector);

  // The Credential Catalogue is only available to IT-Wallet enabled users
  if (!isItwEnabled) {
    return;
  }

  yield* call(fetchCredentialsCatalogueSaga);
}
