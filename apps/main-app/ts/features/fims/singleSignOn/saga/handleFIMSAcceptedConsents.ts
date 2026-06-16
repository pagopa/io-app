import { ActionType } from "typesafe-actions";
import { call, put, select } from "typed-redux-saga/macro";
import { isCancelledFailure } from "@pagopa/io-react-native-http-client";
import {
  fimsAcceptConsentsAction,
  fimsAcceptConsentsFailureAction,
  fimsSignAndRetrieveInAppBrowserUrlAction
} from "../store/actions";
import { oidcProviderDomainSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  absoluteRedirectUrl,
  computeAndTrackAuthenticationError,
  deallocateFimsAndRenewFastLoginSession,
  followProviderRedirects,
  formatHttpClientResponseForMixPanel,
  isFastLoginFailure
} from "./sagaUtils";

export function* handleFimsAcceptedConsents(
  action: ActionType<typeof fimsAcceptConsentsAction>
) {
  const oidcProviderDomain = yield* select(oidcProviderDomainSelector);
  if (!oidcProviderDomain) {
    const debugMessage = `missing FIMS, domain is ${oidcProviderDomain}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsAcceptConsentsFailureAction({
        errorTag: "GENERIC",
        debugMessage
      })
    );
    return;
  }
  const maybeAcceptUrl = action.payload.acceptUrl;

  const acceptUrl = absoluteRedirectUrl(
    maybeAcceptUrl ?? "",
    oidcProviderDomain
  );
  if (!acceptUrl) {
    const debugMessage = `unable to accept grants, could not build url. obtained URL: ${maybeAcceptUrl}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsAcceptConsentsFailureAction({
        errorTag: "GENERIC",
        debugMessage
      })
    );
    return;
  }

  const rpRedirectResponse = yield* call(
    followProviderRedirects,
    { url: acceptUrl, verb: "post" },
    oidcProviderDomain
  );

  if (rpRedirectResponse.type === "failure") {
    if (isCancelledFailure(rpRedirectResponse)) {
      return;
    }
    if (isFastLoginFailure(rpRedirectResponse)) {
      yield* call(deallocateFimsAndRenewFastLoginSession);
      return;
    }
    const debugMessage = `could not get RelyingParty redirect URL, ${formatHttpClientResponseForMixPanel(
      rpRedirectResponse
    )}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsAcceptConsentsFailureAction({
        errorTag: "GENERIC",
        debugMessage
      })
    );
    return;
  }

  yield* put(
    fimsSignAndRetrieveInAppBrowserUrlAction.request(rpRedirectResponse)
  );
}
