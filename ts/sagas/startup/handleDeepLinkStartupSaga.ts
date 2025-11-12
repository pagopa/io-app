import { call, put, select } from "typed-redux-saga/macro";
import { clearLinkingUrl } from "../../features/linking/actions";
import { storedLinkingUrlSelector } from "../../features/linking/reducers";
import {
  isSendAARLink,
  navigateToSendAarFlowIfEnabled
} from "../../features/pn/aar/utils/deepLinking";
import { shouldTriggerWalletUpdate } from "../../utils/deepLinkUtils";
import { handleWalletUpdateSaga } from "../../features/wallet/saga/handleWalletUpdateSaga";

/**
 * Handles stored deep links during app startup after authentication.
 * This saga is called during the startup process and handles different types of deep links:
 * - AAR links for notifications
 * - Wallet update triggers for external Universal Links and specific internal paths
 *
 * This approach separates concerns by keeping navigation logic in appropriate sagas
 * and business logic (like wallet updates) in their respective feature sagas.
 */
export function* handleDeepLinkStartupSaga() {
  const storedLinkingUrl = yield* select(storedLinkingUrlSelector);

  if (storedLinkingUrl === undefined) {
    return false;
  }

  // Handle AAR links first (notifications)
  const shouldNavigateToAAR = yield* select(isSendAARLink, storedLinkingUrl);
  if (shouldNavigateToAAR) {
    const state = yield* select();
    yield* put(clearLinkingUrl());
    yield* call(navigateToSendAarFlowIfEnabled, state, storedLinkingUrl);
    return true;
  }

  // Handle wallet update requirements
  if (shouldTriggerWalletUpdate(storedLinkingUrl)) {
    // Trigger wallet update saga directly without dispatching an action
    // This keeps the logic contained within the startup flow
    yield* call(handleWalletUpdateSaga);
    yield* put(clearLinkingUrl());
    return true;
  }

  // For other deep links, we don't clear them here - let the normal navigation handle them
  // This allows the app to navigate normally after startup is complete
  return false;
}
