import {
  isCancelledFailure,
  nativeRequest,
  setCookie
} from "@pagopa/io-react-native-http-client";
import { supportsInAppBrowser } from "@pagopa/io-react-native-login-utils";
import * as E from "fp-ts/lib/Either";
import { identity, pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import { fimsTokenSelector } from "../../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../../store/reducers/backendStatus";
import { fimsGetConsentsListAction } from "../store/actions";
import { ConsentData } from "../types";
import { deallocateFimsAndRenewFastLoginSession } from "./handleFimsResourcesDeallocation";
import {
  formatHttpClientResponseForMixPanel,
  isFastLoginFailure,
  isValidRedirectResponse,
  logToMixPanel
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
    logToMixPanel(debugMessage);

    yield* put(
      fimsGetConsentsListAction.failure({
        standardMessage: "missing FIMS data",
        debugMessage
      })
    );
    return;
  }

  // Check that the device has a supported InApp Browser
  // (e.g., on Android, you can disable all browsers and the
  // underlying CustomTabs implementation will not work)
  const inAppBrowserSupported = yield* call(supportsInAppBroser);
  if (!inAppBrowserSupported) {
    const debugMessage = `InApp Browser not supported`;
    logToMixPanel(debugMessage);

    yield* put(
      fimsGetConsentsListAction.failure({
        standardMessage: "The InApp Browser is not supported on this device",
        debugMessage
      })
    );
    return;
  }

  yield* call(setCookie, fimsProviderDomain, "/", "_io_fims_token", fimsToken);

  // TODO:: use with future BE lang implementation -- const lang = getLocalePrimaryWithFallback();

  const fimsCTAUrlResponse = yield* call(nativeRequest, {
    verb: "get",
    followRedirects: false,
    url: fimsCTAUrl
  });

  if (!isValidRedirectResponse(fimsCTAUrlResponse)) {
    const debugMessage = `cta url has invalid redirect response: ${formatHttpClientResponseForMixPanel(
      fimsCTAUrlResponse
    )}`;
    logToMixPanel(debugMessage);
    yield* put(
      fimsGetConsentsListAction.failure({
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
    logToMixPanel(debugMessage);
    yield* put(
      fimsGetConsentsListAction.failure({
        standardMessage: "relying party did not redirect to provider",
        debugMessage
      })
    );
    return;
  }

  const getConsentsResult = yield* call(nativeRequest, {
    verb: "get",
    followRedirects: true,
    url: relyingPartyRedirectUrl,
    headers: {
      "Accept-Language": "it-IT"
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
    logToMixPanel(debugMessage);
    yield* put(
      fimsGetConsentsListAction.failure({
        standardMessage: "consent data fetch error",
        debugMessage
      })
    );
    return;
  }
  yield pipe(
    getConsentsResult.body,
    E.tryCatchK(JSON.parse, identity),
    E.map(ConsentData.decode),
    E.flatten,
    E.foldW(
      () => {
        const debugMessage = `could not decode, body: ${getConsentsResult.body}`;
        logToMixPanel(debugMessage);
        return put(
          fimsGetConsentsListAction.failure({
            standardMessage: "could not decode",
            debugMessage
          })
        );
      },
      decodedConsents => put(fimsGetConsentsListAction.success(decodedConsents))
    )
  );
}
