/* eslint-disable jest/expect-expect */
import { type CredentialStatus } from "@pagopa/io-react-native-wallet";
import { testSaga } from "redux-saga-test-plan";
import { selectItwSpecsVersion } from "../../../common/store/selectors/environment";
import { refreshStaleEntries } from "../../utils/refresh";
import { StatusListRepository } from "../../utils/repository";
import { storeLastStatusListCheckTimestamp } from "../../utils/storage";
import { refreshStaleStatusListsSaga } from "../refreshStaleStatusListsSaga";

const makePayload = (sub: string): CredentialStatus.StatusList => ({
  sub,
  iat: 1690000000,
  exp: 1700000000,
  status_list: { bits: 2, lst: "eNrbuRgAAhcBXQ" }
});

describe("refreshStaleStatusListsSaga", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("refreshes stale cached entries and stores the check timestamp", () => {
    const itwVersion = "1.3.3";
    const now = 1700000000000;
    const cached = [makePayload("https://issuer.example/status/1")];
    jest.spyOn(Date, "now").mockReturnValue(now);

    testSaga(refreshStaleStatusListsSaga)
      .next()
      .select(selectItwSpecsVersion)
      .next(itwVersion)
      .call(StatusListRepository.list)
      .next(cached)
      .call(refreshStaleEntries, cached, { itwVersion }, now)
      .next()
      .call(storeLastStatusListCheckTimestamp, now)
      .next()
      .isDone();
  });
});
