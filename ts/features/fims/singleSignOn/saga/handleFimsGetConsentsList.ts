import { identity, pipe } from "fp-ts/lib/function";
import * as E from "fp-ts/lib/Either";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import {
  isCancelledFailure,
  nativeRequest,
  setCookie
} from "@pagopa/io-react-native-http-client";
import { ConsentData } from "../types";
import { fimsGetConsentsListAction } from "../store/actions";
import { fimsTokenSelector } from "../../../../store/reducers/authentication";
import { fimsDomainSelector } from "../../../../store/reducers/backendStatus";
import {
  formatHttpClientResponseForMixPanel,
  logToMixPanel
} from "./sagaUtils";

export function* handleFimsGetConsentsList(
  action: ActionType<typeof fimsGetConsentsListAction.request>
) {
  const fimsToken = yield* select(fimsTokenSelector);
  const oidcProviderUrl = yield* select(fimsDomainSelector);
  const fimsCTAUrl = action.payload.ctaUrl;

  if (!fimsToken || !oidcProviderUrl || !fimsCTAUrl) {
    // TODO:: proper error handling
    logToMixPanel(
      `missing FIMS data: fimsToken: ${!!fimsToken}, oidcProviderUrl: ${!!oidcProviderUrl}, fimsCTAUrl: ${!!fimsCTAUrl}`
    );

    yield* put(fimsGetConsentsListAction.failure("missing FIMS data"));
    return;
  }

  yield* call(setCookie, oidcProviderUrl, "/", "_io_fims_token", fimsToken);

  // TODO:: use with future BE lang implementation -- const lang = getLocalePrimaryWithFallback();

  const getConsentsResult = yield* call(nativeRequest, {
    verb: "get",
    followRedirects: true,
    url: fimsCTAUrl,
    headers: {
      "Accept-Language": "it-IT"
    }
  });

  if (getConsentsResult.type === "failure") {
    if (isCancelledFailure(getConsentsResult)) {
      return;
    }
    logToMixPanel(
      `consent data fetch error: ${formatHttpClientResponseForMixPanel(
        getConsentsResult
      )}`
    );
    yield* put(fimsGetConsentsListAction.failure("consent data fetch error"));
    return;
  }
  yield pipe(
    getConsentsResult.body,
    E.tryCatchK(JSON.parse, identity),
    E.map(ConsentData.decode),
    E.flatten,
    E.foldW(
      () => {
        logToMixPanel(`could not decode: ${getConsentsResult.body}`);
        return put(fimsGetConsentsListAction.failure("could not decode"));
      },
      decodedConsents => put(fimsGetConsentsListAction.success(decodedConsents))
    )
  );
}
