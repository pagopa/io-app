import { call, put, select } from "typed-redux-saga/macro";
import {
  isSendAARLink,
  navigateToSendAarFlowIfEnabled
} from "../../pn/aar/utils/deepLinking";
import { walletUpdate } from "../../wallet/store/actions";
import { clearLinkingUrl } from "../actions";
import { storedLinkingUrlSelector } from "../reducers";

export const isExternalDeepLink = (url: string): boolean =>
  url.startsWith("https://continua.io.pagopa.it") ||
  url.startsWith("ioit://") ||
  url.includes("wallet") ||
  url.includes("payment") ||
  url.includes("idpay") ||
  url.includes("cgn");

export function* handleStoredLinkingUrlIfNeeded() {
  const storedLinkingUrl = yield* select(storedLinkingUrlSelector);
  if (storedLinkingUrl !== undefined) {
    // Check if it's an external deep link that should trigger wallet update
    if (isExternalDeepLink(storedLinkingUrl)) {
      yield* put(walletUpdate());
    }

    const shouldNavigateToAAR = yield* select(isSendAARLink, storedLinkingUrl);
    if (shouldNavigateToAAR) {
      const state = yield* select();
      yield* put(clearLinkingUrl());
      yield* call(navigateToSendAarFlowIfEnabled, state, storedLinkingUrl);
      return true;
    }
  }
  return false;
}
