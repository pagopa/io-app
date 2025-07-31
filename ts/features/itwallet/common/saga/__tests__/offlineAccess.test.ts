import { expectSaga } from "redux-saga-test-plan";
import { select } from "typed-redux-saga/macro";
import { OfflineAccessReasonEnum } from "../../../../ingress/store/reducer";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../../store/actions/securePreferences";
import {
  handleItwOfflineAccessCounterReset,
  handleItwOfflineAccessCounterUp
} from "../offlineAccess";

describe("handleItwOfflineAccessCounterReset", () => {
  it("should handle offline access counter reset on wallet instance status update", async () => {
    await expectSaga(handleItwOfflineAccessCounterReset)
      .put(itwOfflineAccessCounterReset())
      .run();
  });
});

describe("handleItwOfflineAccessCounterUp", () => {
  it("should not increase counter on identification success without an offline access reason", async () => {
    await expectSaga(handleItwOfflineAccessCounterUp)
      .provide([[select(offlineAccessReasonSelector), undefined]])
      .not.put(itwOfflineAccessCounterReset())
      .not.put(itwOfflineAccessCounterUp())
      .run();
  });

  it("should increase counter on identification success with offline acces reason", async () => {
    await expectSaga(handleItwOfflineAccessCounterUp)
      .provide([
        [
          select(offlineAccessReasonSelector),
          OfflineAccessReasonEnum.DEVICE_OFFLINE
        ]
      ])
      .not.put(itwOfflineAccessCounterReset())
      .put(itwOfflineAccessCounterUp())
      .run();
  });
});
