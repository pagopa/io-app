import { call, put, select } from "typed-redux-saga/macro";
import {
  isSendAARLink,
  navigateToSendAarFlowIfEnabled
} from "../../pn/aar/utils/deepLinking";
import { externalWalletUpdate } from "../../wallet/store/actions";
import { clearLinkingUrl } from "../actions";
import { storedLinkingUrlSelector } from "../reducers";
import { shouldTriggerWalletUpdate } from "../../../utils/deepLinkUtils";

export function* handleStoredLinkingUrlIfNeeded() {
  const storedLinkingUrl = yield* select(storedLinkingUrlSelector);
  if (storedLinkingUrl !== undefined) {
    const shouldNavigateToAAR = yield* select(isSendAARLink, storedLinkingUrl);
    if (shouldNavigateToAAR) {
      const state = yield* select();
      yield* put(clearLinkingUrl());
      yield* call(navigateToSendAarFlowIfEnabled, state, storedLinkingUrl);
      return true;
    }

    // Trigger wallet update for external Universal Links and specific internal paths
    if (shouldTriggerWalletUpdate(storedLinkingUrl)) {
      yield* put(externalWalletUpdate());
      yield* put(clearLinkingUrl());
      return true;
    }
  }
  return false;
}
