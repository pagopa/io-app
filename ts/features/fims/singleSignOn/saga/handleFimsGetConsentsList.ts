import {
  HttpClientSuccessResponse,
  isCancelledFailure,
  nativeRequest,
  setCookie
} from "@pagopa/io-react-native-http-client";
import { supportsInAppBrowser } from "@pagopa/io-react-native-login-utils";
import * as E from "fp-ts/lib/Either";
import { identity, pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { fimsTokenSelector } from "../../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import { fimsGetConsentsListAction } from "../store/actions";
import { Consent } from "../../../../../definitions/fims_sso/Consent";
import { preferredLanguageToString } from "../../common/utils";
import { preferredLanguageSelector } from "../../../../store/reducers/persistedPreferences";
import { deallocateFimsAndRenewFastLoginSession } from "./handleFimsResourcesDeallocation";
import {
  computeAndTrackAuthenticationError,
  formatHttpClientResponseForMixPanel,
  isFastLoginFailure,
  isValidRedirectResponse
} from "./sagaUtils";

export function* handleFimsGetConsentsList(
  action: ActionType<typeof fimsGetConsentsListAction.request>
) {
  const fimsToken = yield* select(fimsTokenSelector);
  const fimsProviderDomain = yield* select(fimsDomainSelector);
  const fimsCTAUrl = action.payload.ctaUrl;

  if (!fimsToken || !fimsProviderDomain || !fimsCTAUrl) {
    // TODO:: proper error handling
    const debugMessage = `missing FIMS data: fimsToken: ${!!fimsToken}, oidcProviderUrl: ${!!fimsProviderDomain}, fimsCTAUrl: ${!!fimsCTAUrl}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);

    yield* put(
      fimsGetConsentsListAction.failure({
        errorTag: "GENERIC",
        standardMessage: "missing FIMS data",
        debugMessage
      })
    );
    return;
  }

  // Check that the device has a supported InApp Browser
  // (e.g., on Android, you can disable all browsers and the
  // underlying CustomTabs implementation will not work)
  const inAppBrowserSupported = yield* call(supportsInAppBrowser);
  if (!inAppBrowserSupported) {
    const debugMessage = `InApp Browser not supported`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);

    yield* put(
      fimsGetConsentsListAction.failure({
        errorTag: "MISSING_INAPP_BROWSER",
        standardMessage: "The InApp Browser is not supported on this device",
        debugMessage
      })
    );
    return;
  }

  yield* call(setCookie, fimsProviderDomain, "/", "_io_fims_token", fimsToken);

  const fimsCTAUrlResponse = yield* call(nativeRequest, {
    verb: "get",
    followRedirects: false,
    url: fimsCTAUrl
  });

  if (!isValidRedirectResponse(fimsCTAUrlResponse)) {
    const debugMessage = `cta url has invalid redirect response: ${formatHttpClientResponseForMixPanel(
      fimsCTAUrlResponse
    )}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetConsentsListAction.failure({
        errorTag: "GENERIC",
        standardMessage: "cta url has invalid redirect response",
        debugMessage
      })
    );
    return;
  }

  const relyingPartyRedirectUrl = fimsCTAUrlResponse.headers.location;

  const isRedirectTowardsFimsProvider = relyingPartyRedirectUrl
    .toLowerCase()
    .startsWith(fimsProviderDomain.toLowerCase());

  if (!isRedirectTowardsFimsProvider) {
    const debugMessage = `relying party did not redirect to provider, URL was: ${relyingPartyRedirectUrl}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetConsentsListAction.failure({
        errorTag: "GENERIC",
        standardMessage: "relying party did not redirect to provider",
        debugMessage
      })
    );
    return;
  }

  const preferredLanguageMaybe = yield* select(preferredLanguageSelector);
  const preferredLanguage = yield* call(
    preferredLanguageToString,
    preferredLanguageMaybe
  );

  const getConsentsResult = yield* call(nativeRequest, {
    verb: "get",
    followRedirects: true,
    url: relyingPartyRedirectUrl,
    headers: {
      "Accept-Language": preferredLanguage
    }
  });

  if (getConsentsResult.type === "failure") {
    if (isCancelledFailure(getConsentsResult)) {
      return;
    }

    if (isFastLoginFailure(getConsentsResult)) {
      yield* call(deallocateFimsAndRenewFastLoginSession);
      return;
    }

    const debugMessage = `consent data fetch error: ${formatHttpClientResponseForMixPanel(
      getConsentsResult
    )}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetConsentsListAction.failure({
        errorTag: "GENERIC",
        standardMessage: "consent data fetch error",
        debugMessage
      })
    );
    return;
  }
  const nextAction = yield* call(
    decodeSuccessfulConsentsResponse,
    getConsentsResult
  );
  if (isActionOf(fimsGetConsentsListAction.failure, nextAction)) {
    const debugMessage = nextAction.payload.debugMessage;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
  }
  yield* put(nextAction);
}

// --------- UTILS --------

const decodeSuccessfulConsentsResponse = (
  getConsentsResult: HttpClientSuccessResponse
) =>
  pipe(
    getConsentsResult.body,
    E.tryCatchK(JSON.parse, identity),
    E.map(Consent.decode),
    E.flatten,
    E.foldW(
      () => {
        const debugMessage = `could not decode, body: ${getConsentsResult.body}`;
        return fimsGetConsentsListAction.failure({
          errorTag: "GENERIC",
          standardMessage: "could not decode",
          debugMessage
        });
      },
      decodedConsents => fimsGetConsentsListAction.success(decodedConsents)
    )
  );
