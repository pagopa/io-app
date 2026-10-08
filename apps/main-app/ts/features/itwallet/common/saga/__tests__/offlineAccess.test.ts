import { expectSaga, testSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { select } from "typed-redux-saga/macro";

import { setOfflineAccessReason } from "../../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../../ingress/store/reducer";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import { checkWalletInstanceStateOfflineSaga } from "../../../lifecycle/saga/checkWalletInstanceStateSaga";
import { itwUpdateWalletInstanceStatus } from "../../../walletInstance/store/actions";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../../store/actions/securePreferences";
import { waitForOfflineAccess, watchItwOfflineSaga } from "../offlineAccess";

type TakeEffect = {
  payload: {
    pattern: (action: ReturnType<typeof setOfflineAccessReason>) => boolean;
  };
};

describe("waitForOfflineAccess", () => {
  it.each([
    OfflineAccessReasonEnum.DEVICE_OFFLINE,
    OfflineAccessReasonEnum.SESSION_EXPIRED
  ])("continues immediately when offline reason is %s", offlineAccessReason => {
    testSaga(waitForOfflineAccess)
      .next()
      .select(offlineAccessReasonSelector)
      .next(offlineAccessReason)
      .isDone();
  });

  it("waits for any offline access reason", () => {
    testSaga(waitForOfflineAccess)
      .next()
      .select(offlineAccessReasonSelector)
      .next(undefined)
      .inspect(effect => {
        expect(effect).toMatchObject({ type: "TAKE" });
        const takeEffect = effect as TakeEffect;
        expect(
          takeEffect.payload.pattern(
            setOfflineAccessReason(OfflineAccessReasonEnum.DEVICE_OFFLINE)
          )
        ).toBe(true);
        expect(
          takeEffect.payload.pattern(
            setOfflineAccessReason(OfflineAccessReasonEnum.SESSION_EXPIRED)
          )
        ).toBe(true);
      })
      .next(setOfflineAccessReason(OfflineAccessReasonEnum.SESSION_EXPIRED))
      .isDone();
  });
});

describe("watchItwOfflineSaga", () => {
  it("should reset offline access counter on wallet instance status update", async () => {
    await expectSaga(watchItwOfflineSaga)
      .provide([[select(offlineAccessReasonSelector), undefined]])
      .dispatch(itwUpdateWalletInstanceStatus.success({} as any))
      .put(itwOfflineAccessCounterReset())
      .run();
  });

  it("should check the wallet and increase the counter when starting offline", async () => {
    await expectSaga(watchItwOfflineSaga)
      .provide([
        [
          select(offlineAccessReasonSelector),
          OfflineAccessReasonEnum.SESSION_EXPIRED
        ],
        [matchers.call.fn(checkWalletInstanceStateOfflineSaga), undefined]
      ])
      .call.fn(checkWalletInstanceStateOfflineSaga)
      .put(itwOfflineAccessCounterUp())
      .run();
  });

  it("should check the wallet and increase the counter when offline access starts", async () => {
    await expectSaga(watchItwOfflineSaga)
      .provide([
        [select(offlineAccessReasonSelector), undefined],
        [matchers.call.fn(checkWalletInstanceStateOfflineSaga), undefined]
      ])
      .dispatch(setOfflineAccessReason(OfflineAccessReasonEnum.DEVICE_OFFLINE))
      .put(itwOfflineAccessCounterUp())
      .call.fn(checkWalletInstanceStateOfflineSaga)
      .run();
  });

  it("should wait without checking the wallet or increasing the counter", async () => {
    await expectSaga(watchItwOfflineSaga)
      .provide([[select(offlineAccessReasonSelector), undefined]])
      .not.call.fn(checkWalletInstanceStateOfflineSaga)
      .not.put(itwOfflineAccessCounterUp())
      .run();
  });
});
