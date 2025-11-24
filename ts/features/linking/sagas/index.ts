import { put, select } from "typed-redux-saga/macro";
import { initiateAarFlow } from "../../pn/aar/store/actions";
import { isSendAARLink } from "../../pn/aar/utils/deepLinking";
import { clearLinkingUrl } from "../actions";
import { storedLinkingUrlSelector } from "../reducers";
import { shouldTriggerWalletUpdate } from "../../../utils/deepLinkUtils";
import { walletUpdate } from "../../wallet/store/actions";

export function* handleStoredLinkingUrlIfNeeded() {
  const storedLinkingUrl = yield* select(storedLinkingUrlSelector);
  if (storedLinkingUrl !== undefined) {
    const shouldNavigateToAAR = yield* select(isSendAARLink, storedLinkingUrl);
    if (shouldNavigateToAAR) {
      yield* put(clearLinkingUrl());
      yield* put(initiateAarFlow({ aarUrl: storedLinkingUrl }));

      return true;
    }
    if (shouldTriggerWalletUpdate(storedLinkingUrl)) {
      yield* put(clearLinkingUrl());
      yield* put(walletUpdate());
    }
  }
  return false;
}
