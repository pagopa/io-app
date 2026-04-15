import { EmailString, NonEmptyString } from "@pagopa/ts-commons/lib/strings";
import { SignatureRequestStatusEnum } from "../../../../../definitions/fci/SignatureRequestStatus";
import { IssuerEnvironmentEnum } from "../../../../../definitions/fci/IssuerEnvironment";
import { StatusEnum } from "../../../../../definitions/fci/SignatureDetailView";
import * as mixpanelModule from "../../../../mixpanel";
import trackFciAction from "../index";
import {
  fciLoadQtspClauses,
  fciLoadQtspFilledDocument,
  fciSignatureRequestFromId,
  fciStartRequest,
  fciSigningRequest,
  fciUpdateDocumentSignaturesRequest,
  fciClearStateRequest,
  fciPollFilledDocument
} from "../../store/actions";

describe("index", () => {
  describe("trackFciAction", () => {
    const environment = "test";
    const trackFciActionWithEnv = trackFciAction(environment);

    // Mock mixpanelTrack function
    const mixpanelTrackSpy = jest
      .spyOn(mixpanelModule, "mixpanelTrack")
      .mockImplementation();

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should track fciStartRequest action", () => {
      const action = fciStartRequest();
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciSignatureRequestFromId.request action", () => {
      const payload = "test-id";
      const action = fciSignatureRequestFromId.request(payload);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciSignatureRequestFromId.success action", () => {
      const payload = {
        id: "" as NonEmptyString,
        status: SignatureRequestStatusEnum.SIGNED,
        issuer: {
          email: "" as EmailString,
          description: "" as NonEmptyString,
          environment: IssuerEnvironmentEnum.DEFAULT
        },
        dossier_id: "" as NonEmptyString,
        dossier_title: "" as NonEmptyString,
        signer_id: "" as NonEmptyString,
        expires_at: new Date(),
        documents: [],
        created_at: new Date(),
        updated_at: new Date()
      };
      const action = fciSignatureRequestFromId.success(payload);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciLoadQtspClauses.request action", () => {
      const action = fciLoadQtspClauses.request();
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciLoadQtspClauses.success action", () => {
      const payload = {
        clauses: [],
        document_url: "",
        privacy_url: "",
        privacy_text: "" as NonEmptyString,
        terms_and_conditions_url: "",
        nonce: "" as NonEmptyString
      };
      const action = fciLoadQtspClauses.success(payload);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciLoadQtspFilledDocument.request action", () => {
      const payload = { document_url: "" as NonEmptyString };
      const action = fciLoadQtspFilledDocument.request(payload);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciLoadQtspFilledDocument.success action", () => {
      const payload = { filled_document_url: "" as NonEmptyString };
      const action = fciLoadQtspFilledDocument.success(payload);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciSigningRequest.request action", () => {
      const payload = {
        signature_request_id: "" as NonEmptyString,
        documents_to_sign: [],
        qtsp_clauses: {
          accepted_clauses: [],
          filled_document_url: "" as NonEmptyString,
          nonce: "" as NonEmptyString
        }
      };
      const action = fciSigningRequest.request(payload);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciSigningRequest.success action with control category", () => {
      const payload = {
        id: "" as NonEmptyString,

        signature_request_id: "" as NonEmptyString,

        qtsp_signature_request_id: "" as NonEmptyString,

        status: StatusEnum.COMPLETED
      };
      const action = fciSigningRequest.success(payload);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        event_type: "control",
        environment
      });
    });

    it("should track fciUpdateDocumentSignaturesRequest action", () => {
      const payload = {
        document_id: "" as NonEmptyString,
        signature_fields: []
      };
      const action = fciUpdateDocumentSignaturesRequest(payload);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciClearStateRequest action", () => {
      const action = fciClearStateRequest();
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciPollFilledDocument.request action", () => {
      const action = fciPollFilledDocument.request();
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciPollFilledDocument.success action", () => {
      const payload = { isReady: true };
      const action = fciPollFilledDocument.success(payload);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    it("should track fciPollFilledDocument.cancel action", () => {
      const action = fciPollFilledDocument.cancel();
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "TECH",
        environment
      });
    });

    // Testing failure cases
    it("should track fciSignatureRequestFromId.failure action with error details", () => {
      const error = { kind: "timeout" as const };
      const action = fciSignatureRequestFromId.failure(error);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "KO",
        environment,
        reason: "timeout"
      });
    });

    it("should track fciLoadQtspClauses.failure action with error details", () => {
      const error = { kind: "timeout" as const };
      const action = fciLoadQtspClauses.failure(error);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "KO",
        environment,
        reason: "timeout"
      });
    });

    it("should track fciLoadQtspFilledDocument.failure action with error details", () => {
      const error = { kind: "timeout" as const };
      const action = fciLoadQtspFilledDocument.failure(error);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "KO",
        environment,
        reason: "timeout"
      });
    });

    it("should track fciSigningRequest.failure action with error details", () => {
      const error = { kind: "timeout" as const };
      const action = fciSigningRequest.failure(error);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "KO",
        environment,
        reason: "timeout"
      });
    });

    it("should track fciPollFilledDocument.failure action with error details", () => {
      const error = { kind: "timeout" as const };
      const action = fciPollFilledDocument.failure(error);
      trackFciActionWithEnv(action);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(1);
      expect(mixpanelTrackSpy.mock.calls[0].length).toBe(2);
      expect(mixpanelTrackSpy.mock.calls[0][0]).toBe(action.type);
      expect(mixpanelTrackSpy.mock.calls[0][1]).toEqual({
        event_category: "KO",
        environment,
        reason: "timeout"
      });
    });

    it("should not call mixpanelTrack for unhandled actions", () => {
      const unhandledAction = {
        type: "UNHANDLED_ACTION_TYPE",
        payload: {}
      };

      trackFciActionWithEnv(unhandledAction as any);

      expect(mixpanelTrackSpy.mock.calls.length).toBe(0);
    });
  });
});
