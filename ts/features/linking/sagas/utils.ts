import { call, put, select } from "typed-redux-saga/macro";
import NavigationService from "../../../navigation/NavigationService";
import { MESSAGES_ROUTES } from "../../messages/navigation/routes";
import { isSendAARLink } from "../../pn/aar/utils/deepLinking";
import PN_ROUTES from "../../pn/navigation/routes";
import { clearLinkingUrl } from "../actions";
import { storedLinkingUrlSelector } from "../reducers";

export function* handleStoredLinkingUrlIfNeeded() {
  const storedLinkingUrl = yield* select(storedLinkingUrlSelector);
  if (storedLinkingUrl !== undefined) {
    const shouldNavigateToAAR = yield* select(isSendAARLink, storedLinkingUrl);
    if (shouldNavigateToAAR) {
      yield* put(clearLinkingUrl());
      yield* call(
        NavigationService.navigate,
        MESSAGES_ROUTES.MESSAGES_NAVIGATOR,
        {
          screen: PN_ROUTES.MAIN,
          params: {
            screen: PN_ROUTES.QR_SCAN_FLOW,
            params: { aarUrl: storedLinkingUrl }
          }
        }
      );
      return true;
    }
  }
  return false;
}
