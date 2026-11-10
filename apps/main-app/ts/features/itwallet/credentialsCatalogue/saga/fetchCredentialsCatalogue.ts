import { call, put, select } from "typed-redux-saga/macro";

import { getNetworkError } from "../../../../utils/errors";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../common/store/selectors/environment";
import { getEnv } from "../../common/utils/environment";
import { fetchCredentialsCatalogue } from "../../common/utils/itwCredentialsCatalogueUtils";
import {
  itwFetchCatalogueTranslations,
  itwFetchCredentialsCatalogue
} from "../store/actions";

export function* fetchCredentialsCatalogueSaga() {
  const env = getEnv(yield* select(selectItwEnv));
  const itwVersion = yield* select(selectItwSpecsVersion);
  try {
    const catalogue = yield* call(fetchCredentialsCatalogue, env, itwVersion);
    // Mark translations pending before subscribers can observe catalogue readiness.
    yield* put(itwFetchCatalogueTranslations.request());
    yield* put(itwFetchCredentialsCatalogue.success(catalogue));
  } catch (e) {
    yield* put(itwFetchCredentialsCatalogue.failure(getNetworkError(e)));
  }
}
