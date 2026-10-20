import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";

import { itwSetWalletInstanceRemotelyActive } from "../../../walletInstance/store/actions";
import {
  ItwLifecycleState,
  itwLifecycleStateSelector
} from "../../store/selectors";
import {
  checkCurrentWalletInstanceStateSaga,
  getCurrentStatusWalletInstance
} from "../checkCurrentWalletInstanceStateSaga.ts";

describe("checkCurrentWalletInstanceStateSaga", () => {
  test.each([
    {
      name: "remotely active when remote is active, not revoked, and there is no local instance",
      remoteStatus: { is_revoked: false },
      lifecycle: ItwLifecycleState.INSTALLED,
      expected: true
    },
    {
      name: "not remotely active when remote is revoked",
      remoteStatus: { is_revoked: true },
      lifecycle: ItwLifecycleState.INSTALLED,
      expected: false
    },
    {
      name: "not remotely active when there is a local instance",
      remoteStatus: { is_revoked: false },
      lifecycle: ItwLifecycleState.OPERATIONAL,
      expected: false
    },
    {
      name: "not remotely active when remote status is undefined",
      remoteStatus: undefined,
      lifecycle: ItwLifecycleState.INSTALLED,
      expected: false
    }
  ])(
    "Sets the wallet instance as $name",
    ({ remoteStatus, lifecycle, expected }) =>
      expectSaga(checkCurrentWalletInstanceStateSaga)
        .provide([
          [matchers.call(getCurrentStatusWalletInstance), remoteStatus],
          [matchers.select(itwLifecycleStateSelector), lifecycle]
        ])
        .put(itwSetWalletInstanceRemotelyActive(expected))
        .run(false)
  );
});
