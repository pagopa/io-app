import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import {
  checkCurrentWalletInstanceStateSaga,
  getCurrentStatusWalletInstance
} from "../checkCurrentWalletInstanceStateSaga.ts";
import { itwSetWalletInstanceRemotelyActive } from "../../../common/store/actions/preferences.ts";
import { itwLifecycleIsValidSelector } from "../../store/selectors";

describe("checkCurrentWalletInstanceStateSaga", () => {
  it("Sets the wallet instance as remotely active when remote is active, not revoked, and local is inactive", () => {
    const remoteStatus = { is_revoked: false };
    const localStatus = false;

    return expectSaga(checkCurrentWalletInstanceStateSaga)
      .provide([
        [matchers.call(getCurrentStatusWalletInstance), remoteStatus],
        [matchers.select(itwLifecycleIsValidSelector), localStatus]
      ])
      .put(itwSetWalletInstanceRemotelyActive(true))
      .run();
  });

  it("Sets the wallet instance as not remotely active when remote is revoked", () => {
    const remoteStatus = { is_revoked: true };
    const localStatus = false;

    return expectSaga(checkCurrentWalletInstanceStateSaga)
      .provide([
        [matchers.call(getCurrentStatusWalletInstance), remoteStatus],
        [matchers.select(itwLifecycleIsValidSelector), localStatus]
      ])
      .put(itwSetWalletInstanceRemotelyActive(false))
      .run();
  });

  it("Sets the wallet instance as not remotely active when local is active", () => {
    const remoteStatus = { is_revoked: false };
    const localStatus = true;

    return expectSaga(checkCurrentWalletInstanceStateSaga)
      .provide([
        [matchers.call(getCurrentStatusWalletInstance), remoteStatus],
        [matchers.select(itwLifecycleIsValidSelector), localStatus]
      ])
      .put(itwSetWalletInstanceRemotelyActive(false))
      .run();
  });

  it("Sets the wallet instance as not remotely active when remote status is undefined", () => {
    const remoteStatus = undefined;
    const localStatus = false;

    return expectSaga(checkCurrentWalletInstanceStateSaga)
      .provide([
        [matchers.call(getCurrentStatusWalletInstance), remoteStatus],
        [matchers.select(itwLifecycleIsValidSelector), localStatus]
      ])
      .put(itwSetWalletInstanceRemotelyActive(false))
      .run();
  });
});
