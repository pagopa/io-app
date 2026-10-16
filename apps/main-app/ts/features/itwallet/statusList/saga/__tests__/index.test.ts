import { testSaga } from "redux-saga-test-plan";

import {
  watchItwOfflineStatusListSaga,
  watchItwStatusListAuthenticatedSaga,
  watchItwStatusListSaga
} from "..";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../../common/store/selectors/environment";
import { getEnv } from "../../../common/utils/environment";
import { registerStatusListProperties } from "../../analytics";
import { refreshStaleEntries } from "../../utils/refresh";
import { checkStatusListCoherenceSaga } from "../checkStatusListCoherenceSaga";
import { registerStatusListFetchTaskSaga } from "../registerStatusListFetchTaskSaga";
import { watchItwSpecsVersionStorageSaga } from "../storeItwSpecsVersionSaga";
import { updateCredentialsStatusSaga } from "../updateCredentialsStatusSaga";

describe("watchItwStatusListAuthenticatedSaga", () => {
  it("synchronizes the specs version and registers the background fetch task", () => {
    testSaga(watchItwStatusListAuthenticatedSaga)
      .next()
      .fork(watchItwSpecsVersionStorageSaga)
      .next()
      .fork(registerStatusListFetchTaskSaga)
      .next()
      .isDone();
  });
});

describe("watchItwOfflineStatusListSaga", () => {
  it("stops when Status List is unsupported", () => {
    testSaga(watchItwOfflineStatusListSaga)
      .next()
      .select(selectItwSpecsVersion)
      .next("1.0.0")
      .isDone();
  });

  it("prunes the cache and applies cached Status Lists when supported", () => {
    testSaga(watchItwOfflineStatusListSaga)
      .next()
      .select(selectItwSpecsVersion)
      .next("1.4.6")
      .call(checkStatusListCoherenceSaga)
      .next()
      .call(updateCredentialsStatusSaga, { itwVersion: "1.4.6" })
      .next()
      .isDone();
  });
});

describe("watchItwStatusListSaga", () => {
  it("stops when Status List is unsupported", () => {
    testSaga(watchItwStatusListSaga)
      .next()
      .select(selectItwSpecsVersion)
      .next("1.0.0")
      .isDone();
  });

  it("refreshes stale Status Lists and applies them when supported", () => {
    testSaga(watchItwStatusListSaga)
      .next()
      .select(selectItwSpecsVersion)
      .next("1.4.6")
      .select(selectItwEnv)
      .next("prod")
      .call(refreshStaleEntries, {
        itwVersion: "1.4.6",
        x509CertRoot: getEnv("prod").X509_CERT_ROOT
      })
      .next()
      .call(updateCredentialsStatusSaga, { itwVersion: "1.4.6" })
      .next()
      .call(registerStatusListProperties)
      .next()
      .isDone();
  });
});
