import { expectSaga } from "redux-saga-test-plan";
import { select } from "typed-redux-saga/macro";
import { OfflineAccessReasonEnum } from "../../../../ingress/store/reducer";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../../store/actions/securePreferences";
import { watchItwOfflineAccess } from "../offlineAccess";
import { progressSelector as identificationStatusSelector } from "../../../../identification/store/selectors";
import { itwUpdateWalletInstanceStatus } from "../../../walletInstance/store/actions";
import { identificationSuccess } from "../../../../identification/store/actions";

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
        [select(offlineAccessReasonSelector), undefined]
      ])
      .dispatch(itwUpdateWalletInstanceStatus.success({} as any))
      .put(itwOfflineAccessCounterReset())
      .run();
  });

  test.each([
    ["unidentified", undefined],
    ["unidentified", OfflineAccessReasonEnum.DEVICE_OFFLINE],
    ["unidentified", OfflineAccessReasonEnum.SESSION_EXPIRED],
    ["unidentified", OfflineAccessReasonEnum.SESSION_REFRESH],
    ["identified", undefined]
  ])(
    "should not increase counter if user is %s and access reason is %s",
    async (identificationKind, offlineAccessReason) => {
      await expectSaga(watchItwOfflineAccess)
        .provide([
          [
            select(identificationStatusSelector),
            {
              kind: identificationKind
            }
          ],
          [select(offlineAccessReasonSelector), offlineAccessReason]
        ])
        .not.put(itwOfflineAccessCounterReset())
        .not.put(itwOfflineAccessCounterUp())
        .run();
    }
  );

  test.each([
    ["identified", OfflineAccessReasonEnum.DEVICE_OFFLINE],
    ["identified", OfflineAccessReasonEnum.SESSION_EXPIRED],
    ["identified", OfflineAccessReasonEnum.SESSION_REFRESH]
  ])(
    "should increase counter if user is %s and access reason is %s",
    async (identificationKind, offlineAccessReason) => {
      await expectSaga(watchItwOfflineAccess)
        .provide([
          [
            select(identificationStatusSelector),
            {
              kind: identificationKind
            }
          ],
          [select(offlineAccessReasonSelector), offlineAccessReason]
        ])
        .not.put(itwOfflineAccessCounterReset())
        .put(itwOfflineAccessCounterUp())
        .run();
    }
  );

  it("should not increase counter on identification success without an offline access reason set", async () => {
    await expectSaga(watchItwOfflineAccess)
      .provide([
        [
          select(identificationStatusSelector),
          {
            kind: "unidentified"
          }
        ],
        [select(offlineAccessReasonSelector), undefined]
      ])
      .dispatch(identificationSuccess({} as any))
      .not.put(itwOfflineAccessCounterReset())
      .not.put(itwOfflineAccessCounterUp())
      .run();
  });

  it("should increase counter on identification success with an offline access reason set", async () => {
    await expectSaga(watchItwOfflineAccess)
      .provide([
        [
          select(identificationStatusSelector),
          {
            kind: "unidentified"
          }
        ],
        [
          select(offlineAccessReasonSelector),
          OfflineAccessReasonEnum.DEVICE_OFFLINE
        ]
      ])
      .dispatch(identificationSuccess({} as any))
      .not.put(itwOfflineAccessCounterReset())
      .put(itwOfflineAccessCounterUp())
      .run();
  });
});
