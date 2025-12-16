import { call, put, select } from "typed-redux-saga/macro";
import { ReduxSagaEffect } from "../../../../types/utils";
import { assert } from "../../../../utils/assert";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { itwSetWalletInstanceRemotelyActive } from "../../common/store/actions/preferences.ts";
import { selectItwEnv } from "../../common/store/selectors/environment.ts";
import { getEnv } from "../../common/utils/environment.ts";
import { getCurrentWalletInstanceStatus } from "../../common/utils/itwAttestationUtils.ts";
import { itwLifecycleIsValidSelector } from "../store/selectors";

export function* getCurrentStatusWalletInstance() {
  const sessionToken = yield* select(sessionTokenSelector);
  assert(sessionToken, "Missing session token");

  const env = getEnv(yield* select(selectItwEnv));

  try {
    return yield* call(getCurrentWalletInstanceStatus, env, sessionToken);
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

  const isItwValidLocally = yield* select(itwLifecycleIsValidSelector);

  const itwCanBeReactivated = Boolean(
    remoteWalletInstanceStatus &&
      !remoteWalletInstanceStatus.is_revoked &&
      !isItwValidLocally
  );

  yield* put(itwSetWalletInstanceRemotelyActive(itwCanBeReactivated));
}
