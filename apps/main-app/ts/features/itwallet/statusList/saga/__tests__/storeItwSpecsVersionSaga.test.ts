import { testSaga } from "redux-saga-test-plan";

import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { itwCredentialsStore } from "../../../credentials/store/actions";
import { storeItwSpecsVersion } from "../../utils/storage";
import {
  handleItwSpecsVersionStorageSaga,
  isItwCredentialsStoreWithEid,
  watchItwSpecsVersionStorageSaga
} from "../storeItwSpecsVersionSaga";

const eid = {
  credentialType: CredentialType.PID,
  spec_version: "1.3.3"
} as CredentialMetadata;

const drivingLicense = {
  credentialType: CredentialType.DRIVING_LICENSE
} as CredentialMetadata;

const eidStoreAction = itwCredentialsStore([eid]);

describe("isItwCredentialsStoreWithEid", () => {
  it("matches credential store actions containing an eID", () => {
    expect(isItwCredentialsStoreWithEid(eidStoreAction)).toBe(true);
  });

  it("rejects credential store actions without an eID", () => {
    expect(
      isItwCredentialsStoreWithEid(itwCredentialsStore([drivingLicense]))
    ).toBe(false);
  });

  it("rejects unrelated actions", () => {
    expect(isItwCredentialsStoreWithEid({ type: "unrelated" })).toBe(false);
  });
});

describe("handleItwSpecsVersionStorageSaga", () => {
  it("persists the specs version from the stored eID", () => {
    testSaga(handleItwSpecsVersionStorageSaga, eidStoreAction)
      .next()
      .call(storeItwSpecsVersion, "1.3.3")
      .next()
      .isDone();
  });

  it("swallows storage failures", () => {
    testSaga(handleItwSpecsVersionStorageSaga, eidStoreAction)
      .next()
      .call(storeItwSpecsVersion, "1.3.3")
      .throw(new Error("storage failure"))
      .isDone();
  });
});

describe("watchItwSpecsVersionStorageSaga", () => {
  it("takes the latest credential store action containing an eID", () => {
    testSaga(watchItwSpecsVersionStorageSaga)
      .next()
      .takeLatest(
        isItwCredentialsStoreWithEid,
        handleItwSpecsVersionStorageSaga
      )
      .next()
      .isDone();
  });
});
