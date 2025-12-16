import { HttpClientSuccessResponse } from "@pagopa/io-react-native-http-client";
import {
  fimsAcceptConsentsAction,
  fimsAcceptConsentsFailureAction,
  fimsCancelOrAbortAction,
  fimsGetConsentsListAction,
  fimsSignAndRetrieveInAppBrowserUrlAction
} from "..";
import {
  Consent,
  TypeEnum
} from "../../../../../../../definitions/fims_sso/Consent";
import { FIMS_SSO_ERROR_TAGS, FimsErrorStateType } from "../../reducers";

const errorTags: Array<FIMS_SSO_ERROR_TAGS> = [
  "AUTHENTICATION",
  "GENERIC",
  "MISSING_INAPP_BROWSER"
];

describe("singleSignOn actions", () => {
  describe("fimsGetConsentsListAction.request", () => {
    [false, true].forEach(ephemeralSessionOniOS =>
      it(`Should have a type of 'FIMS_GET_CONSENTS_LIST_REQUEST' with ephemeralSessionOniOS=${ephemeralSessionOniOS} and match expected payload`, () => {
        const payload = {
          ctaText: "Accept",
          ctaUrl: "https://example.com/consent",
          ephemeralSessionOniOS
        };
        const action = fimsGetConsentsListAction.request(payload);
        expect(action.type).toBe("FIMS_GET_CONSENTS_LIST_REQUEST");
        expect(action.payload).toEqual(payload);
      })
    );
  });

  describe("fimsGetConsentsListAction.success", () => {
    it("Should have a type of 'FIMS_GET_CONSENTS_LIST_SUCCESS' and match expected payload", () => {
      const consent: Consent = {
        _links: {
          abort: { href: "https://an.url/abort" },
          consent: { href: "https://an.url/consent" }
        },
        redirect: { display_name: "Go to Redirect" },
        service_id: "01K1E048EYQ7212T55N82S6GVM",
        type: TypeEnum.consent,
        user_metadata: [{ display_name: "fullname", name: "John Smith" }]
      };
      const action = fimsGetConsentsListAction.success(consent);
      expect(action.type).toBe("FIMS_GET_CONSENTS_LIST_SUCCESS");
      expect(action.payload).toEqual(consent);
    });
  });

  describe("fimsGetConsentsListAction.failure", () => {
    errorTags.forEach(errorTag =>
      it(`Should have a type of 'FIMS_GET_CONSENTS_LIST_FAILURE' with errorTag=${errorTag} and match expected error`, () => {
        const error: FimsErrorStateType = {
          debugMessage: "Failed to load consents",
          errorTag
        };
        const action = fimsGetConsentsListAction.failure(error);
        expect(action.type).toBe("FIMS_GET_CONSENTS_LIST_FAILURE");
        expect(action.payload).toEqual(error);
      })
    );
  });

  describe("fimsSignAndRetrieveInAppBrowserUrlAction.request", () => {
    it("Should have a type of 'FIMS_GET_REDIRECT_URL_REQUEST' and match payload", () => {
      const response: HttpClientSuccessResponse = {
        type: "success",
        status: 200,
        body: "{}",
        headers: {
          "content-type": "application/json"
        }
      };
      const action = fimsSignAndRetrieveInAppBrowserUrlAction.request(response);
      expect(action.type).toBe("FIMS_GET_REDIRECT_URL_REQUEST");
      expect(action.payload).toEqual(response);
    });
  });

  describe("fimsSignAndRetrieveInAppBrowserUrlAction.success", () => {
    it("Should have a type of 'FIMS_GET_REDIRECT_URL_SUCCESS' and undefined payload", () => {
      const action = fimsSignAndRetrieveInAppBrowserUrlAction.success();
      expect(action.type).toBe("FIMS_GET_REDIRECT_URL_SUCCESS");
      expect(action.payload).toBeUndefined();
    });
  });

  describe("fimsSignAndRetrieveInAppBrowserUrlAction.failure", () => {
    errorTags.forEach(errorTag =>
      it(`Should have a type of 'FIMS_GET_REDIRECT_URL_FAILURE' with errorTag=${errorTag} and match payload`, () => {
        const error: FimsErrorStateType = {
          debugMessage: "Failed to load consents",
          errorTag
        };
        const action = fimsSignAndRetrieveInAppBrowserUrlAction.failure(error);
        expect(action.type).toBe("FIMS_GET_REDIRECT_URL_FAILURE");
        expect(action.payload).toEqual(error);
      })
    );
  });

  describe("fimsCancelOrAbortAction", () => {
    it("Should have a type of 'FIMS_CANCEL_OR_ABORT' and no payload", () => {
      const action = fimsCancelOrAbortAction();
      expect(action.type).toBe("FIMS_CANCEL_OR_ABORT");
      expect(action.payload).toBeUndefined();
    });
  });

  describe("fimsAcceptConsentsAction", () => {
    it("Should have a type of 'FIMS_ACCEPT_CONSENTS' and match payload", () => {
      const payload = { acceptUrl: "https://example.com/accept" };
      const action = fimsAcceptConsentsAction(payload);
      expect(action.type).toBe("FIMS_ACCEPT_CONSENTS");
      expect(action.payload).toEqual(payload);
    });
  });

  describe("fimsAcceptConsentsFailureAction", () => {
    errorTags.forEach(errorTag =>
      it(`Should have a type of 'FIMS_ACCEPT_CONSENTS_FAILURE' with errorTag=${errorTag} and match payload`, () => {
        const error: FimsErrorStateType = {
          debugMessage: "Failed to load consents",
          errorTag
        };
        const action = fimsAcceptConsentsFailureAction(error);
        expect(action.type).toBe("FIMS_ACCEPT_CONSENTS_FAILURE");
        expect(action.payload).toEqual(error);
      })
    );
  });
});
