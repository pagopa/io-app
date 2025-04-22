import { call, put, select } from "typed-redux-saga/macro";
import { sessionTokenSelector } from "../../../authentication/common/store/selectors";
import { ReduxSagaEffect } from "../../../../types/utils";
import { assert } from "../../../../utils/assert";
import { getCurrentWalletInstanceStatus } from "../../common/utils/itwAttestationUtils.ts";
import { itwSetWalletInstanceRemotelyActive } from "../../common/store/actions/preferences.ts";
import { itwLifecycleIsOperationalOrValid } from "../store/selectors";
import { itwSendExceptionToSentry } from "../../common/utils/itwSentryUtils.ts";

export function* getCurrentStatusWalletInstance() {
  const sessionToken = yield* select(sessionTokenSelector);
  assert(sessionToken, "Missing session token");

  try {
    return yield* call(getCurrentWalletInstanceStatus, sessionToken);
  } catch (e) {
    itwSendExceptionToSentry(
      e,
      "Error while getting current wallet instance status"
    );
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
  const isItwOperationalOrValid = yield* select(
    itwLifecycleIsOperationalOrValid
  );

  const itwCanBeReactivated = Boolean(
    remoteWalletInstanceStatus &&
      !remoteWalletInstanceStatus.is_revoked &&
      !isItwOperationalOrValid
  );

  yield* put(itwSetWalletInstanceRemotelyActive(itwCanBeReactivated));
}
