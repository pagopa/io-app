import { expectSaga } from "redux-saga-test-plan";
import { select } from "typed-redux-saga/macro";
import { progressSelector as identificationStatusSelector } from "../../../../identification/store/selectors";
import { itwUpdateWalletInstanceStatus } from "../../../walletInstance/store/actions";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../../store/actions/securePreferences";
import {
  watchItwOfflineAccess,
  watchOfflineWalletBackgroundActivity
} from "../offlineAccess";
import { startupLoadSuccess } from "../../../../../store/actions/startup";
import {
  isStartupLoaded,
  StartupStatusEnum
} from "../../../../../store/reducers/startup";
import {
  applicationChangeState,
  startApplicationInitialization
} from "../../../../../store/actions/application";
import { backgroundActivityTimeout } from "../../../../../config";
import { resetOfflineAccessReason } from "../../../../ingress/store/actions";

describe("watchItwOfflineAccess", () => {
  it("should handle offline access counter reset on wallet instance status update", async () => {
    await expectSaga(watchItwOfflineAccess)
      .provide([
        [
          select(identificationStatusSelector),
          {
            kind: "identified"
          }
        ],
        [select(isStartupLoaded), StartupStatusEnum.AUTHENTICATED]
      ])
      .dispatch(itwUpdateWalletInstanceStatus.success({} as any))
      .put(itwOfflineAccessCounterReset())
      .not.put(itwOfflineAccessCounterUp())
      .run();
  });

  it("should increase offline access counter when starting with OFFLINE startup status", async () => {
    await expectSaga(watchItwOfflineAccess)
      .provide([
        [
          select(identificationStatusSelector),
          {
            kind: "identified"
          }
        ],
        [select(isStartupLoaded), StartupStatusEnum.OFFLINE]
      ])
      .not.put(itwOfflineAccessCounterReset())
      .put(itwOfflineAccessCounterUp())
      .not.put(itwOfflineAccessCounterUp())
      .run();
  });

  it("should handle offline access count increase when startup status action is dispatched", async () => {
    await expectSaga(watchItwOfflineAccess)
      .provide([
        [
          select(identificationStatusSelector),
          {
            kind: "identified"
          }
        ],
        [select(isStartupLoaded), StartupStatusEnum.INITIAL]
      ])
      .dispatch(startupLoadSuccess(StartupStatusEnum.OFFLINE))
      .not.put(itwOfflineAccessCounterReset())
      .put(itwOfflineAccessCounterUp())
      .not.put(itwOfflineAccessCounterUp())
      .run();
  });
});
