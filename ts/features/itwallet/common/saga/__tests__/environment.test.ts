import { expectSaga } from "redux-saga-test-plan";
import { watchItwEnvironment } from "../environment";
import {
  itwResetEnv,
  itwSetEnv,
  itwSetSpecsVersion
} from "../../store/actions/environment";

describe("watchItwEnvironment", () => {
  it("should change IT-Wallet specs to 1.0 when resetting the env", async () => {
    await expectSaga(watchItwEnvironment)
      .dispatch(itwResetEnv())
      .put(itwSetSpecsVersion("1.0.0"))
      .silentRun();
  });

  it("should change IT-Wallet specs to 1.0 when setting the env to prod", async () => {
    await expectSaga(watchItwEnvironment)
      .dispatch(itwSetEnv("prod"))
      .put(itwSetSpecsVersion("1.0.0"))
      .silentRun();
  });

  it("should not change IT-Wallet specs to 1.0 when setting the env to pre", async () => {
    await expectSaga(watchItwEnvironment)
      .dispatch(itwSetEnv("pre"))
      .not.put(itwSetSpecsVersion("1.0.0"))
      .silentRun();
  });
});
