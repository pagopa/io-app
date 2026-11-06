/**
 * Mock of the `ExpoHttpClient` native module, following
 * https://docs.expo.dev/modules/mocking/. Wire it in Jest setups that do not
 * use the `jest-expo` preset by mocking `src/ExpoHttpClientModule`.
 */
import type {
  HttpCallConfig,
  HttpClientResponse
} from "../src/ExpoHttpClient.types";

export const cancelAllRunningRequests = async (): Promise<void> => undefined;

export const cancelRequestWithId = async (_requestId: string): Promise<void> =>
  undefined;

export const deallocate = async (): Promise<void> => undefined;

export const nativeRequest = async (
  _config: HttpCallConfig
): Promise<HttpClientResponse> => ({
  type: "success",
  status: 200,
  body: "",
  headers: {}
});

export const removeAllCookiesForDomain = (_domain: string): void => undefined;

export const setCookieForDomain = (
  _domain: string,
  _path: string,
  _name: string,
  _value: string
): void => undefined;
