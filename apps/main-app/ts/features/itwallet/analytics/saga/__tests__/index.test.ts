import { testSaga } from "redux-saga-test-plan";

import { itwSetCredentialUpgradeFailed } from "../../../common/store/actions/preferences";
import {
  itwCredentialsRemove,
  itwCredentialsStore
} from "../../../credentials/store/actions";
import { itwFetchCredentialsCatalogue } from "../../../credentialsCatalogue/store/actions";
import {
  handleAggregateCredentialPropertiesRefresh,
  handleCredentialRemovedAnalytics,
  handleCredentialStoredAnalytics
} from "../credentialAnalyticsHandlers";
import { watchItwCredentialsAnalyticsSaga } from "../index";

describe("watchItwCredentialsAnalyticsSaga", () => {
  it("keeps aggregate credential properties in sync with credential, catalogue and upgrade failure changes", () => {
    testSaga(watchItwCredentialsAnalyticsSaga)
      .next()
      .takeEvery(itwCredentialsStore, handleCredentialStoredAnalytics)
      .next()
      .takeEvery(itwCredentialsRemove, handleCredentialRemovedAnalytics)
      .next()
      .takeEvery(
        [itwFetchCredentialsCatalogue.success, itwSetCredentialUpgradeFailed],
        handleAggregateCredentialPropertiesRefresh
      )
      .next()
      .isDone();
  });
});
