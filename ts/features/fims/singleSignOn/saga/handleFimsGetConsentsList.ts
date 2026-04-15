import {
  HttpClientFailureResponse,
  HttpClientSuccessResponse,
  isCancelledFailure,
  nativeRequest,
  setCookie
} from "@pagopa/io-react-native-http-client";
import { supportsInAppBrowser } from "@pagopa/io-react-native-login-utils";
import * as Sentry from "@sentry/react-native";
import * as E from "fp-ts/lib/Either";
import { identity, pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { fimsTokenSelector } from "../../../authentication/common/store/selectors";
import { oidcProviderDomainSelector } from "../../../../store/reducers/backendStatus/remoteConfig";
import {
  fimsGetConsentsListAction,
  fimsSignAndRetrieveInAppBrowserUrlAction
} from "../store/actions";
import { Consent } from "../../../../../definitions/fims_sso/Consent";
import { OIDCError } from "../../../../../definitions/fims_sso/OIDCError";
import { FimsErrorStateType } from "../store/reducers";
import { preferredLanguageSelector } from "../../../../store/reducers/persistedPreferences";
import { preferredLanguageToString } from "../../common/utils";
import {
  computeAndTrackAuthenticationError,
  deallocateFimsAndRenewFastLoginSession,
  followProviderRedirects,
  formatHttpClientResponseForMixPanel,
  isFastLoginFailure,
  isSuccessfulStatusCode,
  isValidRedirectResponse,
  responseContentContainsJson
} from "./sagaUtils";

export function* handleFimsGetConsentsList(
  action: ActionType<typeof fimsGetConsentsListAction.request>
) {
  const fimsToken = yield* select(fimsTokenSelector);
  const oidcProviderDomain = yield* select(oidcProviderDomainSelector);
  const fimsCTAUrl = action.payload.ctaUrl;

  if (!fimsToken || !oidcProviderDomain || !fimsCTAUrl) {
    const debugMessage = `missing FIMS data: fimsToken: ${!!fimsToken}, oidcProviderDomain: ${!!oidcProviderDomain}, fimsCTAUrl: ${!!fimsCTAUrl}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);

    yield* put(
      fimsGetConsentsListAction.failure({
        errorTag: "GENERIC",
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
        debugMessage
      })
    );
    return;
  }

  yield* call(setCookie, oidcProviderDomain, "/", "_io_fims_token", fimsToken);

  const fimsCTAUrlResponse = yield* call(nativeRequest, {
    verb: "get",
    followRedirects: false,
    url: fimsCTAUrl
  });

  if (!isValidRedirectResponse(fimsCTAUrlResponse)) {
    const debugMessage = `Relying Party did not reply with redirect: ${formatHttpClientResponseForMixPanel(
      fimsCTAUrlResponse
    )}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetConsentsListAction.failure({
        errorTag: "GENERIC",
        debugMessage
      })
    );
    return;
  }

  const relyingPartyRedirectUrl = fimsCTAUrlResponse.headers.location;

  const isRedirectTowardsFimsProvider = relyingPartyRedirectUrl
    .toLowerCase()
    .startsWith(oidcProviderDomain.toLowerCase());

  if (!isRedirectTowardsFimsProvider) {
    const debugMessage = `relying party did not redirect to provider, URL was: ${relyingPartyRedirectUrl}`;
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetConsentsListAction.failure({
        errorTag: "GENERIC",
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

  const consetsOrRedirectToRelyingPartyResult = yield* call(
    followProviderRedirects,
    {
      verb: "get",
      followRedirects: false,
      url: relyingPartyRedirectUrl,
      headers: {
        "Accept-Language": preferredLanguage
      }
    },
    oidcProviderDomain
  );

  if (consetsOrRedirectToRelyingPartyResult.type === "failure") {
    if (isCancelledFailure(consetsOrRedirectToRelyingPartyResult)) {
      return;
    }

    if (isFastLoginFailure(consetsOrRedirectToRelyingPartyResult)) {
      yield* call(deallocateFimsAndRenewFastLoginSession);
      return;
    }

    const consentsError = extractConsentsError(
      consetsOrRedirectToRelyingPartyResult
    );
    yield* call(computeAndTrackAuthenticationError, consentsError.debugMessage);
    yield* put(fimsGetConsentsListAction.failure(consentsError));
    return;
  }

  if (
    isSuccessfulStatusCode(consetsOrRedirectToRelyingPartyResult.status) &&
    responseContentContainsJson(consetsOrRedirectToRelyingPartyResult)
  ) {
    // External Relying Party, expected consents list in response
    const nextAction = yield* call(
      decodeSuccessfulConsentsResponse,
      consetsOrRedirectToRelyingPartyResult
    );
    if (isActionOf(fimsGetConsentsListAction.failure, nextAction)) {
      const debugMessage = nextAction.payload.debugMessage;
      yield* call(computeAndTrackAuthenticationError, debugMessage);
    }
    yield* put(nextAction);
  } else {
    // Internal Relying Party, expected response is either a 200 HTML
    // page with an autosubmit form to the relying party redirect uri
    // or it is a direct redirect to the relying party
    yield* put(
      fimsSignAndRetrieveInAppBrowserUrlAction.request(
        consetsOrRedirectToRelyingPartyResult
      )
    );
  }
}

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
        const debugMessage = `could not decode consents, body: ${getConsentsResult.body}`;
        return fimsGetConsentsListAction.failure({
          errorTag: "GENERIC",
          debugMessage
        });
      },
      decodedConsents => fimsGetConsentsListAction.success(decodedConsents)
    )
  );

const extractConsentsError = (
  failureResponse: HttpClientFailureResponse
): FimsErrorStateType => {
  if (failureResponse.code === 400) {
    const parsedFailureContent = safeParseFailureResponseBody(
      failureResponse.message
    );
    const oidcErrorEither = OIDCError.decode(parsedFailureContent);
    if (E.isRight(oidcErrorEither)) {
      return {
        debugMessage: `OIDCError ${oidcErrorEither.right.error} ${oidcErrorEither.right.error_description}`,
        errorTag: "AUTHENTICATION"
      };
    }
  }

  return {
    debugMessage: `consent data fetch error: ${formatHttpClientResponseForMixPanel(
      failureResponse
    )}`,
    errorTag: "GENERIC"
  };
};

const safeParseFailureResponseBody = (failureResponseBody: string) => {
  try {
    return JSON.parse(failureResponseBody);
  } catch (e) {
    Sentry.captureException(e);
    Sentry.captureMessage(
      `handleFimsGetConsentsList.safeParseFailureResponseBody: JSON.parse threw an exception on a ${failureResponseBody?.length}-character long input string`
    );
    return undefined;
  }
};
