/* eslint-disable complexity */
export type HttpBaseConfig = {
  followRedirects?: boolean;
  headers?: Record<string, string>;
  url: string;
};
export type HttpGetConfig = HttpBaseConfig & { verb: "get" };
export type HttpPostConfig = HttpBaseConfig & {
  verb: "post";
  body?: Record<string, string>;
};
export type HttpCallConfig = HttpGetConfig | HttpPostConfig;

export type HttpClientSuccessResponse = {
  type: "success";
  status: number;
  body: string;
  headers: Record<string, string>;
};
export type HttpClientFailureResponse = {
  type: "failure";
  code: number;
  message: string;
};
export type HttpClientResponse =
  | HttpClientSuccessResponse
  | HttpClientFailureResponse;

const fakeAsyncHttpCall = (callback: () => HttpClientResponse) =>
  new Promise<HttpClientSuccessResponse>((resolve, reject) => {
    setTimeout(() => {
      const result = callback();
      if (result.type === "success") {
        resolve(result);
      } else {
        reject(result);
      }
    }, 750 + Math.floor(Math.random() * 1750));
  });

export const FakeBaseUrl = "http://localhost:3000";
export const RPInitialUrl = `${FakeBaseUrl}/fims/relyingParty/1/landingPage`;
const RPRedirectUrl = `${FakeBaseUrl}/fims/relyingParty/1/redirectUri`;
const RPRedirectUrlWithData = `${RPRedirectUrl}?authorization_code=1234567890&nonce=0b4c4749-5c0d-4ea2-925a-00d2f61db8c1&state=aebc026d-b045-448e-a51f-39a2cad2fdee`;
const RPInAppBrowserUrl = `https://www.google.com`;

const ProviderFirstUrl = `${FakeBaseUrl}/fims/provider/oauth/authorize?client_id=1&scope=openid%20profile&response_type=id_token&redirect_uri=${RPRedirectUrl}&response_mode=form_post&nonce=0b4c4749-5c0d-4ea2-925a-00d2f61db8c1&state=aebc026d-b045-448e-a51f-39a2cad2fdee`;
const ProviderSecondUrl = `${FakeBaseUrl}/fims/provider/interaction/3f57b355-be53-4490-b0d0-1c55e805bc2e`;
const ProviderThirdUrl = `${FakeBaseUrl}/fims/provider/oauth/authorize/3f57b355-be53-4490-b0d0-1c55e805bc2e`;
const ProviderFourthUrl = `${FakeBaseUrl}/fims/provider/interaction/a589e42b-4a7d-4ca9-9de0-47036aca71a4`;

const ProviderAcceptFirstUrl = `${FakeBaseUrl}/fims/provider/interaction/a589e42b-4a7d-4ca9-9de0-47036aca71a4/confirm`;
const ProviderAcceptSecondUrl = `${FakeBaseUrl}/fims/provider/oauth/authorize/a589e42b-4a7d-4ca9-9de0-47036aca71a4`;

type FakeCookie = {
  domain: string;
  name: string;
  value: string;
};
const removeTrailingSlash = (str: string) =>
  str.endsWith("/") ? str.slice(0, -1) : str;
const fakeCookieStorage = new Map<string, FakeCookie>();
export const mockSetNativeCookie = (
  domain: string,
  name: string,
  value: string
) =>
  fakeCookieStorage.set(`${removeTrailingSlash(domain)}_${name}`, {
    domain,
    name,
    value
  });
export const mockClearNativeCookie = (domain: string, name: string) =>
  fakeCookieStorage.delete(`${domain}_${name}`);
export const mockClearAllCookies = () => fakeCookieStorage.clear();

const hasValidFIMSToken = () => {
  const fimsCookie = fakeCookieStorage.get(
    `${FakeBaseUrl}/fims/provider_X-IO-Federation-Token`
  );
  return fimsCookie && fimsCookie.value.trim().length > 0;
};

const missingFIMSTokenResponse = () =>
  fakeAsyncHttpCall(() => ({
    type: "failure",
    code: 401,
    message: "Missing or Invalid FIMS token"
  }));

const lollipopSignatureFailedResponse = () =>
  fakeAsyncHttpCall(() => ({
    type: "failure",
    code: 403,
    message: "No lollipop data found"
  }));

const grantsResponse = () =>
  fakeAsyncHttpCall(() => ({
    type: "success",
    status: 200,
    body: JSON.stringify({ grants: ["name", "surname", "email"] }),
    headers: {
      "confirm-url": ProviderAcceptFirstUrl,
      "deny-url": "TODO :)"
    }
  }));

const getLollipopDataErrorIfAny = (headers?: Record<string, string>) => {
  if (!headers) {
    return "No lollipop data found";
  }
  if ((headers.signature?.trim().length ?? 0) === 0) {
    return "Missing 'signature' lollipop header";
  }
  if ((headers["signature-input"]?.trim().length ?? 0) === 0) {
    return "Missing 'signature-input' lollipop header";
  }
  if (
    (headers["x-pagopa-lollipop-original-method"]?.trim().length ?? 0) === 0
  ) {
    return "Missing 'x-pagopa-lollipop-original-method' lollipop header";
  }
  if ((headers["x-pagopa-lollipop-original-url"]?.trim().length ?? 0) === 0) {
    return "Missing 'x-pagopa-lollipop-original-url' lollipop header";
  }
  if (
    (headers["x-pagopa-lollipop-custom-authorization_code"]?.trim().length ??
      0) === 0
  ) {
    return "Missing 'x-pagopa-lollipop-custom-authorization_code' lollipop header";
  }
  return null;
};

const fastForwardToGrantResponse = () => {
  if (hasValidFIMSToken()) {
    return grantsResponse();
  } else {
    return missingFIMSTokenResponse();
  }
};

export const mockHttpNativeCall = (
  config: HttpCallConfig
  // eslint-disable-next-line sonarjs/cognitive-complexity
): Promise<HttpClientResponse> => {
  const verb = config.verb;
  const url = config.url;

  if (url === RPInitialUrl && verb === "get") {
    if (config.followRedirects) {
      return fastForwardToGrantResponse();
    } else {
      return fakeAsyncHttpCall(() => ({
        type: "success",
        status: 303,
        body: "",
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          Location: ProviderFirstUrl
        }
      }));
    }
  } else if (url === ProviderFirstUrl && verb === "get") {
    if (hasValidFIMSToken()) {
      if (config.followRedirects) {
        return fastForwardToGrantResponse();
      } else {
        return fakeAsyncHttpCall(() => ({
          type: "success",
          status: 303,
          body: "",
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            Location: ProviderSecondUrl.replace(FakeBaseUrl, "")
          }
        }));
      }
    } else {
      return missingFIMSTokenResponse();
    }
  } else if (url === ProviderSecondUrl && verb === "get") {
    if (hasValidFIMSToken()) {
      if (config.followRedirects) {
        return fastForwardToGrantResponse();
      } else {
        return fakeAsyncHttpCall(() => ({
          type: "success",
          status: 303,
          body: "",
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            Location: ProviderThirdUrl.replace(FakeBaseUrl, "")
          }
        }));
      }
    } else {
      return missingFIMSTokenResponse();
    }
  } else if (url === ProviderThirdUrl && verb === "get") {
    if (hasValidFIMSToken()) {
      if (config.followRedirects) {
        return fastForwardToGrantResponse();
      } else {
        return fakeAsyncHttpCall(() => ({
          type: "success",
          status: 303,
          body: "",
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            Location: ProviderFourthUrl.replace(FakeBaseUrl, "")
          }
        }));
      }
    } else {
      return missingFIMSTokenResponse();
    }
  } else if (url === ProviderFourthUrl && verb === "get") {
    return fastForwardToGrantResponse();
  } else if (url === ProviderAcceptFirstUrl && verb === "post") {
    if (hasValidFIMSToken()) {
      if (config.followRedirects) {
        return lollipopSignatureFailedResponse();
      } else {
        return fakeAsyncHttpCall(() => ({
          type: "success",
          status: 303,
          body: "",
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            Location: ProviderAcceptSecondUrl
          }
        }));
      }
    } else {
      return missingFIMSTokenResponse();
    }
  } else if (url === ProviderAcceptSecondUrl && verb === "get") {
    if (hasValidFIMSToken()) {
      if (config.followRedirects) {
        return lollipopSignatureFailedResponse();
      } else {
        return fakeAsyncHttpCall(() => ({
          type: "success",
          status: 303,
          body: "",
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            Location: RPRedirectUrlWithData
          }
        }));
      }
    } else {
      return missingFIMSTokenResponse();
    }
  } else if (url === RPRedirectUrlWithData && verb === "get") {
    const lollipopError = getLollipopDataErrorIfAny(config.headers);
    if (lollipopError) {
      return fakeAsyncHttpCall(() => ({
        type: "failure",
        code: 403,
        message: lollipopError
      }));
    } else {
      if (config.followRedirects) {
        return fakeAsyncHttpCall(() => ({
          type: "success",
          status: 200,
          body: "<html><head><title>Welcome User!</title></head><body>You are now authenticated</body></html>",
          headers: {
            "Content-Type": "text/html; charset=utf-8"
          }
        }));
      } else {
        return fakeAsyncHttpCall(() => ({
          type: "success",
          status: 302,
          body: "",
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            Location: RPInAppBrowserUrl
          }
        }));
      }
    }
  }

  return fakeAsyncHttpCall(() => ({
    type: "failure",
    code: 404,
    message: `Url (${url}) does not exist`
  }));
};
