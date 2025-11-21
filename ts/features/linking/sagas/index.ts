import { put, select } from "typed-redux-saga/macro";
import { initiateAarFlow } from "../../pn/aar/store/actions";
import { isSendAARLink } from "../../pn/aar/utils/deepLinking";
import { clearLinkingUrl } from "../actions";
import { storedLinkingUrlSelector } from "../reducers";

export function* handleStoredLinkingUrlIfNeeded() {
  const storedLinkingUrl = yield* select(storedLinkingUrlSelector);
  if (storedLinkingUrl !== undefined) {
    const shouldNavigateToAAR = yield* select(isSendAARLink, storedLinkingUrl);
    if (shouldNavigateToAAR) {
      yield* put(clearLinkingUrl());
      yield* put(initiateAarFlow({ aarUrl: storedLinkingUrl }));

      return true;
    }
  }
  return false;
}
