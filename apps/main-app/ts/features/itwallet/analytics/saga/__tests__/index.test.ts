import { testSaga } from "redux-saga-test-plan";
import {
  itwCredentialsRemove,
  itwCredentialsStore
} from "../../../credentials/store/actions";
import { itwFetchCredentialsCatalogue } from "../../../credentialsCatalogue/store/actions";
import {
  handleCredentialRemovedAnalytics,
  handleCredentialsCatalogueLoadedAnalytics,
  handleCredentialStoredAnalytics
} from "../credentialAnalyticsHandlers";
import { watchItwCredentialsAnalyticsSaga } from "../index";

describe("watchItwCredentialsAnalyticsSaga", () => {
  it("keeps aggregate credential properties in sync with credential and catalogue changes", () => {
    testSaga(watchItwCredentialsAnalyticsSaga)
      .next()
      .takeEvery(itwCredentialsStore, handleCredentialStoredAnalytics)
      .next()
      .takeEvery(itwCredentialsRemove, handleCredentialRemovedAnalytics)
      .next()
      .takeEvery(
        itwFetchCredentialsCatalogue.success,
        handleCredentialsCatalogueLoadedAnalytics
      )
      .next()
      .isDone();
  });
});
