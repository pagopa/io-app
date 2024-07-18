import { defaultRetryingFetch } from "../../../utils/fetch";
import { store } from "../../../boot/configureStoreAndPersistor";
import { isLoggedIn } from "../../../store/reducers/authentication";
import { itwWalletProviderBaseUrl } from "../../../config";

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
 * @throws {@link TypeError} if the wallet provider URL is not valid
 * @returns An object containing the Authorization header if conditions are met, otherwise an empty object
 */
const getAuthHeadersForWalletProvider = (url: URL) => {
  const { origin } = url;
  const { authentication } = store.getState();
  const { origin: itwWpOrigin } = new URL(itwWalletProviderBaseUrl);
  if (origin === itwWpOrigin && isLoggedIn(authentication)) {
    return { Authorization: `Bearer ${authentication.sessionToken}` };
  }
  return {};
};

/**
 * Creates a fetch function for the wallet provider functions that adds the Authorization header
 * with the session token if the user is logged in and the URL matches the wallet provider base URL.
 * @param input - The request of the fetch function.
 * @param init - Set of options that can be used to configure a Fetch request.
 * @returns A fetch function that can be used to make requests to the wallet provider.
 */
export const createItWalletFetch = (input: RequestInfo, init?: RequestInit) => {
  const requestUrl =
    typeof input === "string" ? new URL(input) : new URL(input.url);
  const authHeaders = getAuthHeadersForWalletProvider(requestUrl);
  return defaultRetryingFetch()(input, addAuthHeaders(authHeaders, init));
};
