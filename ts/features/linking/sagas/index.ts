import { call, put, select } from "typed-redux-saga/macro";
import {
  isSendAARLink,
  navigateToSendAarFlowIfEnabled
} from "../../pn/aar/utils/deepLinking";
import { clearLinkingUrl } from "../actions";
import { storedLinkingUrlSelector } from "../reducers";

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
  }
  return false;
}
