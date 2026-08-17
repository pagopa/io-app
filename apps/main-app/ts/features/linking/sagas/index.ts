import { call, put, select } from "typed-redux-saga/macro";

import { waitForMainNavigator } from "../../../navigation/saga/navigation";
import {
  isCGNLinking,
  shouldTriggerWalletUpdate
} from "../../../utils/deepLinkUtils";
import { cgnEycaStatus } from "../../bonus/cgn/store/actions/eyca/details";
import { handleItwStoredDeepLink } from "../../itwallet/common/saga/linking";
import { parseItwDeepLink } from "../../itwallet/common/utils/linking";
import { initiateAarFlow } from "../../pn/aar/store/actions";
import { isSendAarLink } from "../../pn/aar/utils/deepLinking";
import { walletUpdate } from "../../wallet/store/actions";
import { clearLinkingUrl } from "../actions";
import { storedLinkingUrlSelector } from "../reducers";

export function* handleStoredLinkingUrlIfNeeded() {
  const storedLinkingUrl = yield* select(storedLinkingUrlSelector);
  if (storedLinkingUrl !== undefined) {
    const shouldNavigateToAar = yield* select(isSendAarLink, storedLinkingUrl);
    if (shouldNavigateToAar) {
      yield* put(clearLinkingUrl());
      yield* put(initiateAarFlow({ aarUrl: storedLinkingUrl }));

      return true;
    }

    const itwDeepLink = parseItwDeepLink(storedLinkingUrl);
    if (itwDeepLink !== undefined) {
      yield* call(waitForMainNavigator);
      const didHandleItwDeepLink = yield* call(
        handleItwStoredDeepLink,
        itwDeepLink
      );

      if (didHandleItwDeepLink) {
        yield* put(clearLinkingUrl());
        return true;
      }
    }

    if (shouldTriggerWalletUpdate(storedLinkingUrl)) {
      yield* put(clearLinkingUrl());
      yield* put(walletUpdate());
      // If the stored linking URL is a CGN linking, we also need to get EYCA status
      if (isCGNLinking(storedLinkingUrl)) {
        yield* put(cgnEycaStatus.request());
      }
    }
  }
  return false;
}
