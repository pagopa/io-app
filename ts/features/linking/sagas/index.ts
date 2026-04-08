import { put, select } from "typed-redux-saga/macro";
import { initiateAarFlow } from "../../pn/aar/store/actions";
import { isSendAARLink } from "../../pn/aar/utils/deepLinking";
import { clearLinkingUrl } from "../actions";
import { storedLinkingUrlSelector } from "../reducers";
import {
  isCGNLinking,
  shouldTriggerWalletUpdate
} from "../../../utils/deepLinkUtils";
import { walletUpdate } from "../../wallet/store/actions";
import { cgnEycaStatus } from "../../bonus/cgn/store/actions/eyca/details";
import { trackIOOpenedFromUniversalAppLink } from "../analytics";

export function* handleStoredLinkingUrlIfNeeded() {
  const storedLinkingUrl = yield* select(storedLinkingUrlSelector);
  if (storedLinkingUrl !== undefined) {
    trackIOOpenedFromUniversalAppLink(storedLinkingUrl);
    const shouldNavigateToAAR = yield* select(isSendAARLink, storedLinkingUrl);
    if (shouldNavigateToAAR) {
      yield* put(clearLinkingUrl());
      yield* put(initiateAarFlow({ aarUrl: storedLinkingUrl }));

      return true;
    }
    if (shouldTriggerWalletUpdate(storedLinkingUrl)) {
      yield* put(clearLinkingUrl());
      yield* put(walletUpdate({ isRefresh: false }));
      // If the stored linking URL is a CGN linking, we also need to get EYCA status
      if (isCGNLinking(storedLinkingUrl)) {
        yield* put(cgnEycaStatus.request());
      }
    }
  }
  return false;
}
