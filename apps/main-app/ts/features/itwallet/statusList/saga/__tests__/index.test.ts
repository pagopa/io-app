import { testSaga } from "redux-saga-test-plan";

import {
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

describe("watchItwStatusListSaga", () => {
  it("stops when Status List is unsupported", () => {
    testSaga(watchItwStatusListSaga)
      .next()
      .select(selectItwSpecsVersion)
      .next("1.0.0")
      .isDone();
  });

  it("runs Status List startup checks when supported", () => {
    testSaga(watchItwStatusListSaga)
      .next()
      .select(selectItwSpecsVersion)
      .next("1.3.3")
      .select(selectItwEnv)
      .next("prod")
      .call(checkStatusListCoherenceSaga)
      .next()
      .call(refreshStaleEntries, {
        itwVersion: "1.3.3",
        x509CertRoot: getEnv("prod").X509_CERT_ROOT
      })
      .next()
      .call(updateCredentialsStatusSaga, { itwVersion: "1.3.3" })
      .next()
      .call(registerStatusListProperties)
      .next()
      .isDone();
  });
});
