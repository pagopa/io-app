import { call, put, select } from "typed-redux-saga/macro";
import { ReduxSagaEffect } from "../../../../types/utils";
import { assert } from "../../../../utils/assert";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { itwSetWalletInstanceRemotelyActive } from "../../walletInstance/store/actions";
import {
  selectItwEnv,
  selectItwSpecsVersion
} from "../../common/store/selectors/environment.ts";
import { getEnv } from "../../common/utils/environment.ts";
import { getCurrentWalletInstanceStatus } from "../../common/utils/itwAttestationUtils.ts";
import { itwLifecycleIsOperationalOrValid } from "../store/selectors";

export function* getCurrentStatusWalletInstance() {
  const sessionToken = yield* select(sessionTokenSelector);
  assert(sessionToken, "Missing session token");

  const env = getEnv(yield* select(selectItwEnv));
  const itwVersion = yield* select(selectItwSpecsVersion);

  try {
    return yield* call(
      getCurrentWalletInstanceStatus,
      env,
      itwVersion,
      sessionToken
    );
  } catch (e) {
    return undefined;
  }
}

export function* checkCurrentWalletInstanceStateSaga(): Generator<
  ReduxSagaEffect,
  void
> {
  yield* put(itwSetWalletInstanceRemotelyActive(undefined));

  const remoteWalletInstanceStatus = yield* call(
    getCurrentStatusWalletInstance
  );
  // An operational local wallet instance can exist even without a PID, for example
  // after a failed activation, and should not be treated as remotely active.
  const isItwOperationalOrValidLocally = yield* select(
    itwLifecycleIsOperationalOrValid
  );

  const itwCanBeReactivated = Boolean(
    remoteWalletInstanceStatus &&
    !remoteWalletInstanceStatus.is_revoked &&
    !isItwOperationalOrValidLocally
  );

  yield* put(itwSetWalletInstanceRemotelyActive(itwCanBeReactivated));
}
