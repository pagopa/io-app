import { call, put, select } from "typed-redux-saga/macro";
import { sessionTokenSelector } from "../../../../store/reducers/authentication";
import { ReduxSagaEffect } from "../../../../types/utils";
import { assert } from "../../../../utils/assert";
import { getCurrentWalletInstanceStatus } from "../../common/utils/itwAttestationUtils.ts";
import { itwWalletInstanceStatusSelector } from "../../walletInstance/store/selectors";
import { itwSetWalletInstanceRemotelyActive } from "../../common/store/actions/preferences.ts";

export function* getCurrentStatusWalletInstance() {
  const sessionToken = yield* select(sessionTokenSelector);
  assert(sessionToken, "Missing session token");

  try {
    return yield* call(getCurrentWalletInstanceStatus, sessionToken);
  } catch (e) {
    return undefined;
  }
}

export function* checkCurrentWalletInstanceStateSaga(): Generator<
  ReduxSagaEffect,
  void
> {
  const remoteStatus = yield* call(getCurrentStatusWalletInstance);
  const localStatus = yield* select(itwWalletInstanceStatusSelector);

  const isRemotelyActive = Boolean(
    remoteStatus && !remoteStatus.is_revoked && !localStatus
  );

  yield* put(itwSetWalletInstanceRemotelyActive(isRemotelyActive));
}
