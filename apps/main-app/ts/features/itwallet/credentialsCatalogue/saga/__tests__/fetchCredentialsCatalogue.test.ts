import { testSaga } from "redux-saga-test-plan";

import { getNetworkError } from "../../../../../utils/errors";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../../common/store/selectors/environment";
import { getEnv } from "../../../common/utils/environment";
import { fetchCredentialsCatalogue } from "../../../common/utils/itwCredentialsCatalogueUtils";
import {
  itwFetchCatalogueTranslations,
  itwFetchCredentialsCatalogue
} from "../../store/actions";
import { fetchCredentialsCatalogueSaga } from "../fetchCredentialsCatalogue";

describe("fetchCredentialsCatalogueSaga", () => {
  const catalogue = {
    taxonomy_uri: "",
    exp: 1700000000,
    iat: 1600000000,
    credentials: []
  };

  it("marks translations loading before publishing catalogue success", () => {
    testSaga(fetchCredentialsCatalogueSaga)
      .next()
      .select(selectItwEnv)
      .next("pre")
      .select(selectItwSpecsVersion)
      .next("1.0.0")
      .call(fetchCredentialsCatalogue, getEnv("pre"), "1.0.0")
      .next(catalogue)
      .put(itwFetchCatalogueTranslations.request())
      .next()
      .put(itwFetchCredentialsCatalogue.success(catalogue))
      .next()
      .isDone();
  });

  it("does not start translations when catalogue fetching fails", () => {
    const error = new Error("Catalogue unavailable");
    testSaga(fetchCredentialsCatalogueSaga)
      .next()
      .next("pre")
      .next("1.0.0")
      .throw(error)
      .put(itwFetchCredentialsCatalogue.failure(getNetworkError(error)))
      .next()
      .isDone();
  });
});
