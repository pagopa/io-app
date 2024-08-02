import {
  HttpClientFailureResponse,
  HttpClientResponse,
  HttpClientSuccessResponse
} from "@pagopa/io-react-native-http-client";
import { pipe } from "fp-ts/lib/function";
import { URL as PolyfillURL } from "react-native-url-polyfill";
import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

export const buildAbsoluteUrl = (
  redirect: string | undefined = undefined,
  originalRequestUrl: string
) => {
  if (!redirect) {
    return undefined;
  }
  try {
    const redirectUrl = new PolyfillURL(redirect);
    return redirectUrl.href;
  } catch (error) {
    try {
      const originalUrl = new PolyfillURL(originalRequestUrl);
      const origin = originalUrl.origin;
      const composedUrlString = redirect.startsWith("/")
        ? `${origin}${redirect}`
        : `${origin}/${redirect}`;
      const composedUrl = new PolyfillURL(composedUrlString);
      return composedUrl.href;
    } catch {
      return undefined;
    }
  }
};

export const getDomainFromUrl = (url: string) => {
  try {
    return new PolyfillURL(url).origin;
  } catch {
    return undefined;
  }
};

export const foldNativeHttpClientResponse =
  <T>(
    foldSuccess: (res: HttpClientSuccessResponse) => T,
    foldFailure: (res: HttpClientFailureResponse) => T
  ) =>
  (res: HttpClientResponse) => {
    switch (res.type) {
      case "success":
        return foldSuccess(res);
      default:
        return foldFailure(res);
    }
  };

export const formatHttpClientResponseForMixPanel = (
  resData: HttpClientResponse
) =>
  pipe(
    resData,
    foldNativeHttpClientResponse(
      success =>
        `${success.type}, ${success.status}, ${success.body}, ${success.headers}`,
      failure =>
        `${failure.type}, ${failure.code}, ${failure.message}, ${failure.headers}`
    )
  );

export const logToMixPanel = (toLog: string) => {
  void mixpanelTrack(
    "FIMS_TECH_TEMP_ERROR",
    buildEventProperties("TECH", undefined, { message: toLog })
  );
};

export const isRedirect = (statusCode: number) =>
  statusCode >= 300 && statusCode < 400;

export const isValidRedirectResponse = (
  res: HttpClientResponse
): res is HttpClientSuccessResponse & {
  headers: { location: string };
} =>
  res.type === "success" &&
  isRedirect(res.status) &&
  !!res.headers.location &&
  res.headers.location.trim().length > 0;

export const isFastLoginFailure = (res: HttpClientFailureResponse) =>
  res.code === 401;
