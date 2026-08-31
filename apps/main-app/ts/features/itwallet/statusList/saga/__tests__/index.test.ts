import { testSaga } from "redux-saga-test-plan";

import {
  watchItwStatusListAuthenticatedSaga,
  watchItwStatusListSaga
} from "..";
import { selectItwSpecsVersion } from "../../../common/store/selectors/environment";
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
      .next("1.4.6")
      .call(checkStatusListCoherenceSaga)
      .next()
      .call(refreshStaleEntries, { itwVersion: "1.4.6" })
      .next()
      .call(updateCredentialsStatusSaga, { itwVersion: "1.4.6" })
      .next()
      .call(registerStatusListProperties)
      .next()
      .isDone();
  });
});
