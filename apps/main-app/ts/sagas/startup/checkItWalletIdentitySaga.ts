import { CommonActions, StackActions } from "@react-navigation/native";
import { call, cancel, fork, select, take } from "typed-redux-saga/macro";

import { selectItwEnv } from "../../features/itwallet/common/store/selectors/environment";
import { getEnv } from "../../features/itwallet/common/utils/environment";
import { selectFiscalCodeFromEid } from "../../features/itwallet/credentials/store/selectors";
import { watchItwLifecycleSaga } from "../../features/itwallet/lifecycle/saga";
import { itwLifecycleIdentityCheckCompleted } from "../../features/itwallet/lifecycle/store/actions";
import { itwLifecycleIsValidSelector } from "../../features/itwallet/lifecycle/store/selectors";
import { ITW_ROUTES } from "../../features/itwallet/navigation/routes";
import { profileFiscalCodeSelector } from "../../features/settings/common/store/selectors";
import NavigationService from "../../navigation/NavigationService";

/**
 * When IT Wallet is valid, this saga checks whether the stored eID was issued
 * to the same user that is authenticated by comparing fiscal codes.
 *
 * If they are different, the user is taken to a new screen where the active wallet instance must be reset before continuing.
 */
export function* checkItWalletIdentitySaga() {
  const env = getEnv(yield* select(selectItwEnv));
  const isWalletValid = yield* select(itwLifecycleIsValidSelector);

  if (!isWalletValid) {
    return;
  }

  const authenticatedUserFiscalCode = yield* select(profileFiscalCodeSelector);
  const eidFiscalCode = yield* select(selectFiscalCodeFromEid);

  if (
    env.BYPASS_IDENTITY_MATCH ||
    authenticatedUserFiscalCode === eidFiscalCode
  ) {
    return;
  }

  // Fork the saga that handles the wallet reset. It is forked here and then cancelled because
  // in the startup saga the main IT Wallet saga is forked later, after this saga is called.
  const itwResetWatcher = yield* fork(watchItwLifecycleSaga);

  yield* call(
    NavigationService.dispatchNavigationAction,
    CommonActions.navigate(ITW_ROUTES.MAIN, {
      screen: ITW_ROUTES.IDENTITY_NOT_MATCHING_SCREEN
    })
  );

  yield* take(itwLifecycleIdentityCheckCompleted);

  yield* call(
    NavigationService.dispatchNavigationAction,
    StackActions.popToTop()
  );
  yield* cancel(itwResetWatcher);
}
