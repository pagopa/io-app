interface AuthHeaders {
  Authorization?: string;
}

function addAuthHeaders(options: RequestInit, authHeaders: AuthHeaders) {
  return {
    ...options,
    headers: {
      ...options.headers,
      ...authHeaders
    }
  };
}

export default function createItWalletFetch(
  request: RequestInfo,
  options: RequestInit
) {
  const requestUrl =
    typeof request === "string" ? new URL(request) : new URL(request.url);
  const authHeaders: AuthHeaders =
    requestUrl.origin === new URL("LOL").origin
      ? {
          Authorization: `Bearer`
        }
      : {};

  return fetch(request, addAuthHeaders(options, authHeaders));
}
