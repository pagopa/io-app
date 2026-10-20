import { requireNativeModule } from "expo-modules-core";

export type AreaError = "NativeRedirectError";

export type LoginUtilsError = {
  code: AreaError;
  userInfo: {
    error: Error;
    parameter: Array<string> | undefined;
    statusCode: number | undefined;
    url: string | undefined;
  };
};

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
 * Retrieves all redirects for the given URL with the specified headers and
 * callback URL parameter.
 */
export const getRedirects = (
  url: string,
  headers: object,
  callbackURLParameter: string
): Promise<Array<string>> =>
  ExpoLoginUtils.getRedirects(url, headers, callbackURLParameter);

export const isLoginUtilsError = (e: unknown): e is LoginUtilsError =>
  (e as LoginUtilsError).userInfo !== undefined;
