import { requireNativeModule } from "expo-modules-core";

interface ExpoLoginUtilsModule {
  getRedirects: (
    url: string,
    headers: object,
    callbackURLParameter: string
  ) => Promise<Array<string>>;
}

const ExpoLoginUtils =
  requireNativeModule<ExpoLoginUtilsModule>("ExpoLoginUtils");

/**
 * Retrieves all redirects for the given URL with the specified headers and callback URL parameter.
 */
export const getRedirects = (
  url: string,
  headers: object,
  callbackURLParameter: string
): Promise<Array<string>> =>
  ExpoLoginUtils.getRedirects(url, headers, callbackURLParameter);
