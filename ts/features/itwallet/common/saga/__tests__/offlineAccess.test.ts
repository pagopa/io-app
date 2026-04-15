import { expectSaga } from "redux-saga-test-plan";
import { select } from "typed-redux-saga/macro";
import { progressSelector as identificationStatusSelector } from "../../../../identification/store/selectors";
import { itwUpdateWalletInstanceStatus } from "../../../walletInstance/store/actions";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../../store/actions/securePreferences";
import { watchItwOfflineAccess } from "../offlineAccess";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import { setOfflineAccessReason } from "../../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../../ingress/store/reducer";

describe("watchItwOfflineAccess", () => {
  it("should reset offline access counter on wallet instance status update", async () => {
    await expectSaga(watchItwOfflineAccess)
      .provide([
        [
          select(identificationStatusSelector),
          {
            kind: "identified"
          }
        ],
        [select(offlineAccessReasonSelector), undefined]
      ])
      .dispatch(itwUpdateWalletInstanceStatus.success({} as any))
      .put(itwOfflineAccessCounterReset())
      .run();
  });

  it("should increase offline access counter when starting with defined offline access reason", async () => {
    await expectSaga(watchItwOfflineAccess)
      .provide([
        [
          select(identificationStatusSelector),
          {
            kind: "identified"
          }
        ],
        [select(offlineAccessReasonSelector), "network_error"]
      ])
      .put(itwOfflineAccessCounterUp())
      .run();
  });

  it("should increase offline access counter when setOfflineAccessReason is dispatched with defined reason", async () => {
    await expectSaga(watchItwOfflineAccess)
      .provide([
        [
          select(identificationStatusSelector),
          {
            kind: "identified"
          }
        ],
        [select(offlineAccessReasonSelector), undefined]
      ])
      .dispatch(setOfflineAccessReason(OfflineAccessReasonEnum.DEVICE_OFFLINE))
      .put(itwOfflineAccessCounterUp())
      .run();
  });

  it("should not increase offline access counter when setOfflineAccessReason is dispatched with undefined reason", async () => {
    await expectSaga(watchItwOfflineAccess)
      .provide([
        [
          select(identificationStatusSelector),
          {
            kind: "identified"
          }
        ],
        [select(offlineAccessReasonSelector), undefined]
      ])
      .not.put(itwOfflineAccessCounterUp())
      .run();
  });
});
