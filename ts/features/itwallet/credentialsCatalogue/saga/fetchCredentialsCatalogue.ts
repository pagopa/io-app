import { call, put, select } from "typed-redux-saga/macro";
import { getNetworkError } from "../../../../utils/errors";
import { getEnv } from "../../common/utils/environment";
import { selectItwEnv } from "../../common/store/selectors/environment";
import { fetchCredentialsCatalogue } from "../../common/utils/itwCredentialsCatalogueUtils";
import { itwFetchCredentialsCatalogue } from "../store/actions";

export function* fetchCredentialsCatalogueSaga() {
  const env = getEnv(yield* select(selectItwEnv));
  try {
    const catalogue = yield* call(fetchCredentialsCatalogue, env);
    yield* put(itwFetchCredentialsCatalogue.success(catalogue));
  } catch (e) {
    yield* put(itwFetchCredentialsCatalogue.failure(getNetworkError(e)));
  }
}
