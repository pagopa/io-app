import { Consent } from "@io-app/api-types/generated/definitions/fims_sso/Consent";
import { ServiceDetails } from "@io-app/api-types/generated/definitions/services/ServiceDetails";
import { ServiceId } from "@io-app/api-types/generated/definitions/services/ServiceId";
import {
  deallocate,
  HttpCallConfig,
  HttpClientFailureResponse,
  HttpClientResponse,
  HttpClientSuccessResponse,
  nativeRequest,
  removeAllCookiesForDomain
} from "@pagopa/io-react-native-http-client";
import { OrganizationFiscalCode } from "@pagopa/ts-commons/lib/strings";
import { StackActions } from "@react-navigation/native";
import { expectSaga, testSaga } from "redux-saga-test-plan";

import NavigationService from "../../../../../navigation/NavigationService";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { oidcProviderDomainSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { refreshSessionToken } from "../../../../authentication/fastLogin/store/actions/tokenRefreshActions";
import { loadServiceDetail } from "../../../../services/details/store/actions/details";
import { trackAuthenticationError } from "../../../common/analytics";
import { fimsGetConsentsListAction } from "../../store/actions";
import { fimsRelyingPartyDomainSelector } from "../../store/selectors";
import {
  absoluteRedirectUrl,
  absoluteRedirectUrlFromHttpClientResponse,
  computeAndTrackAuthenticationError,
  deallocateFimsAndRenewFastLoginSession,
  foldNativeHttpClientResponse,
  followProviderRedirects,
  formatHttpClientResponseForMixPanel,
  getDomainFromUrl,
  handleFimsBackNavigation,
  handleFimsResourcesDeallocation,
  isFastLoginFailure,
  isRedirectStatusCode,
  isSuccessfulStatusCode,
  isValidRedirectResponse,
  responseContentContainsJson
} from "../sagaUtils";

jest.mock("@pagopa/io-react-native-http-client", () => ({
  ...jest.requireActual("@pagopa/io-react-native-http-client"),
  nativeRequest: jest.fn()
}));

const mockedNativeRequest = nativeRequest as jest.Mock;

const mockSuccessResponse: HttpClientSuccessResponse = {
  type: "success",
  status: 200,
  body: "ok",
  headers: {}
};

const mockFailureResponse: HttpClientFailureResponse = {
  type: "failure",
  code: 500,
  message: "generic error",
  headers: {}
};

describe("sagaUtils", () => {
  describe("absoluteRedirectUrlFromHttpClientResponse", () => {
    it("returns undefined when the response is not a valid redirect", () => {
      expect(
        absoluteRedirectUrlFromHttpClientResponse(
          mockFailureResponse,
          "https://example.com"
        )
      ).toBeUndefined();
    });

    it("delegates to absoluteRedirectUrl when the response is a valid redirect", () => {
      const validRedirectResponse: HttpClientSuccessResponse = {
        ...mockSuccessResponse,
        status: 302,
        headers: { location: "https://provider.com/callback" }
      };

      expect(
        absoluteRedirectUrlFromHttpClientResponse(
          validRedirectResponse,
          "https://example.com"
        )
      ).toBe("https://provider.com/callback");
    });
  });

  describe("absoluteRedirectUrl", () => {
    const scenarios: ReadonlyArray<{
      expected: string | undefined;
      name: string;
      originalRequestUrl: string;
      redirect: string | undefined;
    }> = [
      {
        expected: undefined,
        name: "redirect undefined",
        originalRequestUrl: "https://example.com",
        redirect: undefined
      },
      {
        expected: "https://provider.com/callback",
        name: "absolute redirect",
        originalRequestUrl: "https://example.com",
        redirect: "https://provider.com/callback"
      },
      {
        expected: "https://example.com/callback",
        name: "relative redirect with leading slash",
        originalRequestUrl: "https://example.com",
        redirect: "/callback"
      },
      {
        expected: "https://example.com/callback",
        name: "relative redirect without leading slash",
        originalRequestUrl: "https://example.com",
        redirect: "callback"
      },
      {
        expected: undefined,
        name: "relative redirect with invalid originalRequestUrl",
        originalRequestUrl: "not-a-url",
        redirect: "callback"
      }
    ];

    test.each(scenarios)(
      "returns $expected for $name",
      ({ redirect, originalRequestUrl, expected }) => {
        expect(absoluteRedirectUrl(redirect, originalRequestUrl)).toBe(
          expected
        );
      }
    );
  });

  describe("getDomainFromUrl", () => {
    const scenarios: ReadonlyArray<{
      expected: string | undefined;
      name: string;
      url: string;
    }> = [
      {
        expected: "https://example.com",
        name: "valid url",
        url: "https://example.com/path?x=1"
      },
      {
        expected: "https://example.com:8080",
        name: "valid url with specific port",
        url: "https://example.com:8080/path"
      },
      { expected: undefined, name: "invalid url", url: "not-a-url" }
    ];

    test.each(scenarios)("returns $expected for $name", ({ url, expected }) => {
      expect(getDomainFromUrl(url)).toBe(expected);
    });
  });

  describe("foldNativeHttpClientResponse", () => {
    it("calls foldSuccess when type is success", () => {
      const foldSuccess = jest.fn();
      const foldFailure = jest.fn();
      foldNativeHttpClientResponse(
        foldSuccess,
        foldFailure
      )(mockSuccessResponse);
      expect(foldSuccess).toHaveBeenCalledWith(mockSuccessResponse);
      expect(foldFailure).not.toHaveBeenCalled();
    });

    it("calls foldFailure when type is failure", () => {
      const foldSuccess = jest.fn();
      const foldFailure = jest.fn();
      foldNativeHttpClientResponse(
        foldSuccess,
        foldFailure
      )(mockFailureResponse);
      expect(foldSuccess).not.toHaveBeenCalled();
      expect(foldFailure).toHaveBeenCalledWith(mockFailureResponse);
    });
  });

  describe("formatHttpClientResponseForMixPanel", () => {
    const scenarios: ReadonlyArray<{
      expected: string;
      name: string;
      response: HttpClientResponse;
    }> = [
      {
        name: "success response",
        response: mockSuccessResponse,
        expected: "success, 200, ok"
      },
      {
        name: "failure response",
        response: mockFailureResponse,
        expected: "failure, 500, generic error"
      }
    ];

    test.each(scenarios)(
      "returns $expected for $name",
      ({ response, expected }) => {
        expect(formatHttpClientResponseForMixPanel(response)).toBe(expected);
      }
    );
  });

  describe("computeAndTrackAuthenticationError", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));

    const serviceId = "serviceId" as ServiceId;
    const service = {
      id: serviceId,
      name: "service name",
      organization: {
        name: "org name",
        fiscal_code: "FSCLCD" as OrganizationFiscalCode
      }
    } as ServiceDetails;
    const consent = {
      _links: {
        abort: { href: "https://example.com/abort" },
        consent: { href: "https://example.com/consent" }
      },
      service_id: serviceId,
      redirect: { display_name: "example.com" },
      type: "consent",
      user_metadata: []
    } as Consent;

    const stateWithService = appReducer(
      undefined,
      applicationChangeState("active")
    );
    const stateWithServiceDetails = appReducer(
      stateWithService,
      loadServiceDetail.success(service)
    );
    const state = appReducer(
      stateWithServiceDetails,
      fimsGetConsentsListAction.success(consent)
    );

    it("tracks with service details when a relying party service id is set", () =>
      expectSaga(computeAndTrackAuthenticationError, "some-reason")
        .withState(state)
        .call(
          trackAuthenticationError,
          service.id,
          service.name,
          service.organization.name,
          service.organization.fiscal_code,
          "some-reason"
        )
        .run());

    it("tracks with all fields undefined when no relying party service id is set", () =>
      expectSaga(computeAndTrackAuthenticationError, "some-reason")
        .withState(globalState)
        .call(
          trackAuthenticationError,
          undefined,
          undefined,
          undefined,
          undefined,
          "some-reason"
        )
        .run());
  });

  describe("isValidRedirectResponse", () => {
    const scenarios: ReadonlyArray<{
      expected: boolean;
      name: string;
      response: HttpClientResponse;
    }> = [
      {
        name: "type is failure",
        response: mockFailureResponse,
        expected: false
      },
      {
        name: "type success but status not redirect",
        response: {
          ...mockSuccessResponse,
          status: 200,
          headers: { location: "https://x.com" }
        },
        expected: false
      },
      {
        name: "type success, redirect status, location missing",
        response: {
          ...mockSuccessResponse,
          status: 302,
          headers: {}
        },
        expected: false
      },
      {
        name: "type success, redirect status, location is whitespace",
        response: {
          ...mockSuccessResponse,
          status: 302,
          headers: { location: "  " }
        },
        expected: false
      },
      {
        name: "type success, redirect status, location valid",
        response: {
          ...mockSuccessResponse,
          status: 302,
          headers: { location: "https://x.com" }
        },
        expected: true
      }
    ];

    test.each(scenarios)(
      "returns $expected for $name",
      ({ response, expected }) => {
        expect(isValidRedirectResponse(response)).toBe(expected);
      }
    );
  });

  describe("isSuccessfulStatusCode", () => {
    const scenarios: ReadonlyArray<{
      expected: boolean;
      statusCode: number;
    }> = [
      { statusCode: 199, expected: false },
      { statusCode: 300, expected: false },
      { statusCode: 200, expected: true },
      { statusCode: 299, expected: true }
    ];

    test.each(scenarios)(
      "returns $expected for status $statusCode",
      ({ statusCode, expected }) => {
        expect(isSuccessfulStatusCode(statusCode)).toBe(expected);
      }
    );
  });

  describe("isRedirectStatusCode", () => {
    const scenarios: ReadonlyArray<{ expected: boolean; status: number }> = [
      { status: 299, expected: false },
      { status: 300, expected: true },
      { status: 399, expected: true },
      { status: 400, expected: false }
    ];

    test.each(scenarios)(
      "returns $expected for status $status",
      ({ status, expected }) => {
        expect(isRedirectStatusCode(status)).toBe(expected);
      }
    );
  });

  describe("isFastLoginFailure", () => {
    const scenarios: ReadonlyArray<{
      code: number;
      expected: boolean;
      name: string;
    }> = [
      { name: "401 unauthorized", code: 401, expected: true },
      { name: "any other code", code: 403, expected: false }
    ];

    test.each(scenarios)(
      "returns $expected for $name",
      ({ code, expected }) => {
        expect(isFastLoginFailure({ ...mockFailureResponse, code })).toBe(
          expected
        );
      }
    );
  });

  describe("responseContentContainsJson", () => {
    const scenarios: ReadonlyArray<{
      expected: boolean;
      name: string;
      response: HttpClientResponse;
    }> = [
      {
        name: "missing content-type",
        response: { ...mockSuccessResponse, headers: {} },
        expected: false
      },
      {
        name: "text/html",
        response: {
          ...mockSuccessResponse,
          headers: { "content-type": "text/html" }
        },
        expected: false
      },
      {
        name: "application/json",
        response: {
          ...mockSuccessResponse,
          headers: { "content-type": "application/json" }
        },
        expected: true
      },
      {
        name: "application/json; charset=utf-8",
        response: {
          ...mockSuccessResponse,
          headers: { "content-type": "application/json; charset=utf-8" }
        },
        expected: true
      },
      {
        name: "application/hal+json",
        response: {
          ...mockSuccessResponse,
          headers: { "content-type": "application/hal+json" }
        },
        expected: true
      },
      {
        name: "application/ld+json",
        response: {
          ...mockSuccessResponse,
          headers: { "content-type": "application/ld+json" }
        },
        expected: true
      }
    ];

    test.each(scenarios)(
      "returns $expected for $name",
      ({ response, expected }) => {
        expect(responseContentContainsJson(response)).toBe(expected);
      }
    );
  });

  describe("handleFimsBackNavigation", () => {
    it("dispatches a pop navigation action", () =>
      expectSaga(handleFimsBackNavigation)
        .call(NavigationService.dispatchNavigationAction, StackActions.pop())
        .run());
  });

  describe("handleFimsResourcesDeallocation", () => {
    const oidcDomain = "oidc-provider.example.com";
    const relyingPartyDomain = "relying-party.example.com";

    it("removes cookies for both domains when both are set", () => {
      testSaga(handleFimsResourcesDeallocation)
        .next()
        .select(oidcProviderDomainSelector)
        .next(oidcDomain)
        .select(fimsRelyingPartyDomainSelector)
        .next(relyingPartyDomain)
        .call(removeAllCookiesForDomain, oidcDomain)
        .next()
        .call(removeAllCookiesForDomain, relyingPartyDomain)
        .next()
        .call(deallocate)
        .next()
        .isDone();
    });

    it("removes cookies only for the oidc provider domain when only that is set", () => {
      testSaga(handleFimsResourcesDeallocation)
        .next()
        .select(oidcProviderDomainSelector)
        .next(oidcDomain)
        .select(fimsRelyingPartyDomainSelector)
        .next(undefined)
        .call(removeAllCookiesForDomain, oidcDomain)
        .next()
        .call(deallocate)
        .next()
        .isDone();
    });

    it("removes cookies only for the relying party domain when only that is set", () => {
      testSaga(handleFimsResourcesDeallocation)
        .next()
        .select(oidcProviderDomainSelector)
        .next(undefined)
        .select(fimsRelyingPartyDomainSelector)
        .next(relyingPartyDomain)
        .call(removeAllCookiesForDomain, relyingPartyDomain)
        .next()
        .call(deallocate)
        .next()
        .isDone();
    });

    it("always deallocates even when no domain is set", () => {
      testSaga(handleFimsResourcesDeallocation)
        .next()
        .select(oidcProviderDomainSelector)
        .next(undefined)
        .select(fimsRelyingPartyDomainSelector)
        .next(undefined)
        .call(deallocate)
        .next()
        .isDone();
    });
  });

  describe("deallocateFimsAndRenewFastLoginSession", () => {
    it("deallocates fims resources and requests a session token refresh", () => {
      testSaga(deallocateFimsAndRenewFastLoginSession)
        .next()
        .call(handleFimsResourcesDeallocation)
        .next()
        .put(
          refreshSessionToken.request({
            showIdentificationModalAtStartup: false,
            showLoader: true,
            withUserInteraction: true
          })
        )
        .next()
        .isDone();
    });
  });

  describe("followProviderRedirects", () => {
    const httpClientConfig: HttpCallConfig = {
      verb: "get",
      url: "https://relying-party.example.com/start"
    };
    const fimsDomain = "https://provider.example.com";

    beforeEach(() => {
      mockedNativeRequest.mockReset();
    });

    it("returns the response as-is when there is no redirect and it is a failure", async () => {
      const failureResponse: HttpClientFailureResponse = {
        ...mockFailureResponse,
        code: 500
      };
      mockedNativeRequest.mockResolvedValueOnce(failureResponse);

      const result = await followProviderRedirects(
        httpClientConfig,
        fimsDomain
      );

      expect(result).toEqual(failureResponse);
      expect(mockedNativeRequest).toHaveBeenCalledTimes(1);
    });

    it("returns the response as-is when there is no redirect and it is a successful status code", async () => {
      const successResponse: HttpClientSuccessResponse = {
        ...mockSuccessResponse,
        status: 200
      };
      mockedNativeRequest.mockResolvedValueOnce(successResponse);

      const result = await followProviderRedirects(
        httpClientConfig,
        fimsDomain
      );

      expect(result).toEqual(successResponse);
      expect(mockedNativeRequest).toHaveBeenCalledTimes(1);
    });

    it("returns a synthetic failure response when the redirect response is malformed", async () => {
      const malformedResponse: HttpClientSuccessResponse = {
        ...mockSuccessResponse,
        status: 302,
        headers: {}
      };
      mockedNativeRequest.mockResolvedValueOnce(malformedResponse);

      const result = await followProviderRedirects(
        httpClientConfig,
        fimsDomain
      );

      expect(result).toEqual({
        code: 302,
        type: "failure",
        message:
          "malformed HTTP redirect response, location header value: undefined",
        headers: {}
      });
      expect(mockedNativeRequest).toHaveBeenCalledTimes(1);
    });

    it("returns the redirect response as-is when the redirect domain is not the fims provider domain", async () => {
      const redirectToOtherDomain: HttpClientSuccessResponse = {
        ...mockSuccessResponse,
        status: 302,
        headers: { location: "https://not-the-provider.example.com/path" }
      };
      mockedNativeRequest.mockResolvedValueOnce(redirectToOtherDomain);

      const result = await followProviderRedirects(
        httpClientConfig,
        fimsDomain
      );

      expect(result).toEqual(redirectToOtherDomain);
      expect(mockedNativeRequest).toHaveBeenCalledTimes(1);
    });

    it("recursively follows the redirect when the redirect domain is the fims provider domain", async () => {
      const redirectToProvider: HttpClientSuccessResponse = {
        ...mockSuccessResponse,
        status: 302,
        headers: { location: `${fimsDomain}/next-step` }
      };
      const finalResponse: HttpClientSuccessResponse = {
        ...mockSuccessResponse,
        status: 200,
        body: "final content"
      };
      mockedNativeRequest
        .mockResolvedValueOnce(redirectToProvider)
        .mockResolvedValueOnce(finalResponse);

      const result = await followProviderRedirects(
        httpClientConfig,
        fimsDomain
      );

      expect(result).toEqual(finalResponse);
      expect(mockedNativeRequest).toHaveBeenCalledTimes(2);
      expect(mockedNativeRequest).toHaveBeenNthCalledWith(2, {
        verb: "get",
        url: `${fimsDomain}/next-step`,
        followRedirects: false
      });
    });
  });
});
