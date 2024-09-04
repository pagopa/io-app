import {
  HttpClientSuccessResponse,
  isCancelledFailure,
  nativeRequest,
  setCookie
} from "@pagopa/io-react-native-http-client";
import * as E from "fp-ts/lib/Either";
import { identity, pipe } from "fp-ts/lib/function";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType, isActionOf } from "typesafe-actions";
import { fimsTokenSelector } from "../../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../../store/reducers/backendStatus";
import { fimsGetConsentsListAction } from "../store/actions";
import { ConsentData } from "../types";
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
        standardMessage: "missing FIMS data",
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
    yield* call(computeAndTrackAuthenticationError, debugMessage);
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
    yield* call(computeAndTrackAuthenticationError, debugMessage);
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
    yield* call(computeAndTrackAuthenticationError, debugMessage);
    yield* put(
      fimsGetConsentsListAction.failure({
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
    E.map(ConsentData.decode),
    E.flatten,
    E.foldW(
      () => {
        const debugMessage = `could not decode, body: ${getConsentsResult.body}`;
        return fimsGetConsentsListAction.failure({
          standardMessage: "could not decode",
          debugMessage
        });
      },
      decodedConsents => fimsGetConsentsListAction.success(decodedConsents)
    )
  );
