import { testSaga } from "redux-saga-test-plan";
import { HttpClientSuccessResponse } from "@pagopa/io-react-native-http-client";
import * as LoginUtils from "@pagopa/io-react-native-login-utils";
import {
  computeAndTrackInAppBrowserOpening,
  handleFimsAuthorizationOrImplicitCodeFlow,
  handleInAppBrowserErrorIfNeeded,
  postToRelyingPartyWithImplicitCodeFlow,
  redirectToRelyingPartyWithAuthorizationCodeFlow,
  RelyingPartyOutput
} from "../handleFimsAuthorizationOrImplicitCodeFlow";
import { fimsSignAndRetrieveInAppBrowserUrlAction } from "../../store/actions";
import {
  computeAndTrackAuthenticationError,
  handleFimsBackNavigation,
  handleFimsResourcesDeallocation
} from "../sagaUtils";
import { fimsEphemeralSessionOniOSSelector } from "../../store/selectors";

describe("handleFimsAuthorizationOrImplicitCodeFlow", () => {
  describe("handleFimsAuthorizationOrImplicitCodeFlow", () => {
    it("should follow expected authorization code flow", () => {
      const relyingPartyOutput: RelyingPartyOutput = {
        relyingPartyUrl: "https://relyingParty.url",
        response: {
          type: "success",
          status: 302,
          body: "",
          headers: {
            location: "/inAppBrowserLandingPage"
          }
        }
      };
      const actionPayload: HttpClientSuccessResponse = {
        type: "success",
        status: 302,
        body: "",
        headers: {}
      };
      const inputAction =
        fimsSignAndRetrieveInAppBrowserUrlAction.request(actionPayload);
      testSaga(handleFimsAuthorizationOrImplicitCodeFlow, inputAction)
        .next()
        .call(redirectToRelyingPartyWithAuthorizationCodeFlow, actionPayload)
        .next(relyingPartyOutput)
        .put(fimsSignAndRetrieveInAppBrowserUrlAction.success())
        .next()
        .call(handleFimsResourcesDeallocation)
        .next()
        .call(computeAndTrackInAppBrowserOpening)
        .next()
        .select(fimsEphemeralSessionOniOSSelector)
        .next(false)
        .call(
          LoginUtils.openAuthenticationSession,
          "https://relyingParty.url/inAppBrowserLandingPage",
          "iossoapi",
          true
        )
        .next()
        .call(handleFimsBackNavigation)
        .next()
        .isDone();
    });
    it("should follow expected implicit code flow", () => {
      const relyingPartyOutput: RelyingPartyOutput = {
        relyingPartyUrl: "https://relyingParty.url",
        response: {
          type: "success",
          status: 302,
          body: "",
          headers: {
            location: "/inAppBrowserLandingPage"
          }
        }
      };
      const actionPayload: HttpClientSuccessResponse = {
        type: "success",
        status: 200,
        body: "",
        headers: {}
      };
      const inputAction =
        fimsSignAndRetrieveInAppBrowserUrlAction.request(actionPayload);
      testSaga(handleFimsAuthorizationOrImplicitCodeFlow, inputAction)
        .next()
        .call(postToRelyingPartyWithImplicitCodeFlow, actionPayload)
        .next(relyingPartyOutput)
        .put(fimsSignAndRetrieveInAppBrowserUrlAction.success())
        .next()
        .call(handleFimsResourcesDeallocation)
        .next()
        .call(computeAndTrackInAppBrowserOpening)
        .next()
        .select(fimsEphemeralSessionOniOSSelector)
        .next(true)
        .call(
          LoginUtils.openAuthenticationSession,
          "https://relyingParty.url/inAppBrowserLandingPage",
          "iossoapi",
          false
        )
        .next()
        .call(handleFimsBackNavigation)
        .next()
        .isDone();
    });
    it("should stop if the authorization code flow has failed", () => {
      const actionPayload: HttpClientSuccessResponse = {
        type: "success",
        status: 302,
        body: "",
        headers: {}
      };
      const inputAction =
        fimsSignAndRetrieveInAppBrowserUrlAction.request(actionPayload);
      testSaga(handleFimsAuthorizationOrImplicitCodeFlow, inputAction)
        .next()
        .call(redirectToRelyingPartyWithAuthorizationCodeFlow, actionPayload)
        .next(undefined)
        .isDone();
    });
    it("should stop if the implicit code flow has failed", () => {
      const actionPayload: HttpClientSuccessResponse = {
        type: "success",
        status: 200,
        body: "",
        headers: {}
      };
      const inputAction =
        fimsSignAndRetrieveInAppBrowserUrlAction.request(actionPayload);
      testSaga(handleFimsAuthorizationOrImplicitCodeFlow, inputAction)
        .next()
        .call(postToRelyingPartyWithImplicitCodeFlow, actionPayload)
        .next(undefined)
        .isDone();
    });
    it("should report an error when it is not possible to retrieve the redirect url for the InApp Browser (response is not a redirect but a 2XX success)", () => {
      const debugMessage = `InApp Browser url call failed or without a valid redirect, code: 200`;
      const relyingPartyOutput: RelyingPartyOutput = {
        relyingPartyUrl: "https://relyingParty.url",
        response: {
          type: "success",
          status: 200,
          body: "",
          headers: {}
        }
      };
      const actionPayload: HttpClientSuccessResponse = {
        type: "success",
        status: 302,
        body: "",
        headers: {}
      };
      const inputAction =
        fimsSignAndRetrieveInAppBrowserUrlAction.request(actionPayload);
      testSaga(handleFimsAuthorizationOrImplicitCodeFlow, inputAction)
        .next()
        .call(redirectToRelyingPartyWithAuthorizationCodeFlow, actionPayload)
        .next(relyingPartyOutput)
        .call(computeAndTrackAuthenticationError, debugMessage)
        .next()
        .put(
          fimsSignAndRetrieveInAppBrowserUrlAction.failure({
            errorTag: "GENERIC",
            debugMessage
          })
        )
        .next()
        .isDone();
    });
    it("should report an error when it is not possible to retrieve the redirect url for the InApp Browser (response is not a redirect but a failure)", () => {
      const debugMessage = `InApp Browser url call failed or without a valid redirect, code: 500, message: <html><body>Internal Server Error</body></html>`;
      const relyingPartyOutput: RelyingPartyOutput = {
        relyingPartyUrl: "https://relyingParty.url",
        response: {
          type: "failure",
          code: 500,
          message: "<html><body>Internal Server Error</body></html>",
          headers: {}
        }
      };
      const actionPayload: HttpClientSuccessResponse = {
        type: "success",
        status: 302,
        body: "",
        headers: {}
      };
      const inputAction =
        fimsSignAndRetrieveInAppBrowserUrlAction.request(actionPayload);
      testSaga(handleFimsAuthorizationOrImplicitCodeFlow, inputAction)
        .next()
        .call(redirectToRelyingPartyWithAuthorizationCodeFlow, actionPayload)
        .next(relyingPartyOutput)
        .call(computeAndTrackAuthenticationError, debugMessage)
        .next()
        .put(
          fimsSignAndRetrieveInAppBrowserUrlAction.failure({
            errorTag: "GENERIC",
            debugMessage
          })
        )
        .next()
        .isDone();
    });
    it("should call 'handleInAppBrowserErrorIfNeeded' if the InApp Browser opening fails", () => {
      const inAppBrowserOpeningError = Error("Unable to open InApp Browser");
      const relyingPartyOutput: RelyingPartyOutput = {
        relyingPartyUrl: "https://relyingParty.url",
        response: {
          type: "success",
          status: 302,
          body: "",
          headers: {
            location: "/inAppBrowserLandingPage"
          }
        }
      };
      const actionPayload: HttpClientSuccessResponse = {
        type: "success",
        status: 302,
        body: "",
        headers: {}
      };
      const inputAction =
        fimsSignAndRetrieveInAppBrowserUrlAction.request(actionPayload);
      testSaga(handleFimsAuthorizationOrImplicitCodeFlow, inputAction)
        .next()
        .call(redirectToRelyingPartyWithAuthorizationCodeFlow, actionPayload)
        .next(relyingPartyOutput)
        .put(fimsSignAndRetrieveInAppBrowserUrlAction.success())
        .next()
        .call(handleFimsResourcesDeallocation)
        .next()
        .call(computeAndTrackInAppBrowserOpening)
        .next()
        .select(fimsEphemeralSessionOniOSSelector)
        .next(false)
        .call(
          LoginUtils.openAuthenticationSession,
          "https://relyingParty.url/inAppBrowserLandingPage",
          "iossoapi",
          true
        )
        .throw(inAppBrowserOpeningError)
        .call(handleInAppBrowserErrorIfNeeded, inAppBrowserOpeningError)
        .next()
        .call(handleFimsBackNavigation)
        .next()
        .isDone();
    });
  });
});
