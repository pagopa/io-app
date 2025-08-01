import { expectSaga } from "redux-saga-test-plan";
import { select } from "typed-redux-saga/macro";
import { progressSelector as identificationStatusSelector } from "../../../../identification/store/selectors";
import { offlineAccessReasonSelector } from "../../../../ingress/store/selectors";
import { itwUpdateWalletInstanceStatus } from "../../../walletInstance/store/actions";
import {
  itwOfflineAccessCounterReset,
  itwOfflineAccessCounterUp
} from "../../store/actions/securePreferences";
import { watchItwOfflineAccess } from "../offlineAccess";

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
      .not.put(itwOfflineAccessCounterUp())
      .run();
  });
});
