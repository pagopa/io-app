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
  handleItwOfflineAccessCounterUpOnIdentificationSuccess,
  handleItwOfflineAccessCounterUpOnReasonSet
} from "../offlineAccess";
import { setOfflineAccessReason } from "../../../../ingress/store/actions";

describe("handleItwOfflineAccessCounterReset", () => {
  it("should handle offline access counter reset on wallet instance status update", async () => {
    await expectSaga(handleItwOfflineAccessCounterReset)
      .put(itwOfflineAccessCounterReset())
      .run();
  });
});

describe("handleItwOfflineAccessCounterUpOnIdentificationSuccess", () => {
  it("should not increase counter on identification success without an offline access reason", async () => {
    await expectSaga(handleItwOfflineAccessCounterUpOnIdentificationSuccess)
      .provide([[select(offlineAccessReasonSelector), undefined]])
      .not.put(itwOfflineAccessCounterReset())
      .not.put(itwOfflineAccessCounterUp())
      .run();
  });

  it("should not increase counter on identification success with an wrong offline access reason", async () => {
    await expectSaga(handleItwOfflineAccessCounterUpOnIdentificationSuccess)
      .provide([
        [
          select(offlineAccessReasonSelector),
          OfflineAccessReasonEnum.SESSION_REFRESH
        ]
      ])
      .not.put(itwOfflineAccessCounterReset())
      .not.put(itwOfflineAccessCounterUp())
      .run();
  });

  it("should increase counter on identification success with offline acces reason", async () => {
    await expectSaga(handleItwOfflineAccessCounterUpOnIdentificationSuccess)
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

describe("handleItwOfflineAccessCounterUpOnReasonSet", () => {
  it("should not increase counter on DEVICE_OFFLINE access reason dispatch", async () => {
    await expectSaga(
      handleItwOfflineAccessCounterUpOnReasonSet,
      setOfflineAccessReason(OfflineAccessReasonEnum.DEVICE_OFFLINE)
    )
      .not.put(itwOfflineAccessCounterReset())
      .not.put(itwOfflineAccessCounterUp())
      .run();
  });

  test.each([
    OfflineAccessReasonEnum.SESSION_REFRESH,
    OfflineAccessReasonEnum.SESSION_EXPIRED
  ])("should increase counter on %s access reason dispatch", async reason => {
    await expectSaga(
      handleItwOfflineAccessCounterUpOnReasonSet,
      setOfflineAccessReason(reason)
    )
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
