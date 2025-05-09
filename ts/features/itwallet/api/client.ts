import { URL as PolyfillURL } from "react-native-url-polyfill";
import { defaultRetryingFetch } from "../../../utils/fetch";
import { itwWalletProviderBaseUrl } from "../../../config";
import { SessionToken } from "../../../types/SessionToken";
import { createClient } from "../../../../definitions/itw/client";

export class ItwSessionExpiredError extends Error {}

/**
 * Authorization headers which contains the bearer token for the current session.
 */
type AuthHeaders = {
  Authorization?: string;
};

/**
 * Adds the authorization headers to the request initialization object.
 * It merges the provided authorization headers with the existing headers.
 * @param authHeaders - An object containing authorization headers to be added to the request.
 * @param init - An optional RequestInit object that may contain existing headers.
 * @returns An object with the merged headers
 */
const addAuthHeaders = (authHeaders: AuthHeaders, init?: RequestInit) => ({
  ...init,
  headers: {
    ...init?.headers,
    ...authHeaders
  }
});

/**
 * Getter for the authorization headers for the wallet provider based on the provided URL.
 * If the URL's origin matches the wallet provider's base URL and the user is logged in,
 * it returns the Authorization header with the session token.
 * Otherwise, it returns an empty object.
 * @param url - The URL object to check against the wallet provider base URL
 * @param sessionToken - The session token bearer token to be added to the Authorization header
 * @throws {@link TypeError} if the wallet provider URL is not valid
 * @returns An object containing the Authorization header if conditions are met, otherwise an empty object
 */
const getAuthHeadersForWalletProvider = (
  url: string,
  sessionToken: SessionToken
) => {
  const urlTarget = new PolyfillURL(url);
  const urlWp = new PolyfillURL(itwWalletProviderBaseUrl);
  if (urlTarget.origin === urlWp.origin) {
    return { Authorization: `Bearer ${sessionToken}` };
  }
  return {};
};

/**
 * Creates a fetch function for the wallet provider functions that adds the Authorization header
 * with the session token if the user is logged in and the URL matches the wallet provider base URL.
 * @param url - The URL object to check against the wallet provider base URL
 * @param sessionToken - The session token bearer token to be added to the Authorization header
 * @returns A fetch function that can be used to make requests to the wallet provider.
 * @throws ItwSessionExpiredError
 */
export function createItWalletFetch(
  url: string,
  sessionToken: SessionToken
): typeof fetch {
  const authHeader = getAuthHeadersForWalletProvider(url, sessionToken);
  const fetch = defaultRetryingFetch();

  return (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, addAuthHeaders(authHeader, init)).then(
      throwSessionExpiredOrContinue
    );
}

const throwSessionExpiredOrContinue = (response: Response) => {
  if (!response.ok && response.status === 401) {
    throw new ItwSessionExpiredError();
  }
  return response;
};

/**
 * Creates an instance of the IT Wallet client.
 * @param baseUrl - The base URL for the IT Wallet API.
 * @param sessionToken - The session token used for authorization in API calls.
 * @returns An instance of the IT Wallet client configured with the provided base URL and fetch function.
 */
export const createItWalletClient = (
  baseUrl: string,
  sessionToken: SessionToken
) =>
  createClient({
    baseUrl,
    fetchApi: createItWalletFetch(baseUrl, sessionToken)
  });

export type ItWalletClient = ReturnType<typeof createItWalletClient>;
