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
import { updateCredentialsStatusSaga } from "../updateCredentialsStatusSaga";

describe("watchItwStatusListAuthenticatedSaga", () => {
  it("stops when Status List is unsupported", () => {
    testSaga(watchItwStatusListAuthenticatedSaga)
      .next()
      .select(selectItwSpecsVersion)
      .next("1.0.0")
      .isDone();
  });

  it("registers the background fetch task when Status List is supported", () => {
    testSaga(watchItwStatusListAuthenticatedSaga)
      .next()
      .select(selectItwSpecsVersion)
      .next("1.3.3")
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
      .call(checkStatusListCoherenceSaga)
      .next()
      .call(refreshStaleEntries, { itwVersion: "1.3.3" })
      .next()
      .call(updateCredentialsStatusSaga, { itwVersion: "1.3.3" })
      .next()
      .call(registerStatusListProperties)
      .next()
      .isDone();
  });
});
