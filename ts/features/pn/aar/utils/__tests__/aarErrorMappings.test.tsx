import { AARProblemJson } from "../../../../../../definitions/pn/aar/AARProblemJson";
import { trackSendAarMandateCieDataError } from "../../analytics";
import {
  CieExpiredComponent,
  GenericCieValidationErrorComponent
} from "../../components/errors/SendAarCieValidationErrorComponent";
import { SendAarGenericErrorComponent } from "../../components/errors/SendAARErrorComponent";
import {
  getAarErrorBehaviour,
  isAarAttachmentTtlError,
  testable
} from "../aarErrorMappings";
jest.mock("../../analytics");
jest.mock("fp-ts/lib/function", () => ({
  ...jest.requireActual("fp-ts/lib/function"),
  constVoid: jest.fn()
}));

const { cieErrors, sendAarProblemJsonErrorCodes, specificBehavioursByStatus } =
  testable!;

const makeProblemJson = (
  errorCode?: string,
  status?: number
): AARProblemJson | undefined =>
  errorCode != null
    ? {
        status: (status ?? 422) as 599,
        detail: "A detail",
        errors: [{ code: errorCode }]
      }
    : undefined;

describe("AarErrorMappings", () => {
  beforeEach(jest.clearAllMocks);
  describe("resolveAarError", () => {
    [422, 400, 500, 418, 404].forEach(responseStatus => {
      Object.values(sendAarProblemJsonErrorCodes).forEach(errCode => {
        const maybeSpecificErrorBehaviour =
          specificBehavioursByStatus[responseStatus] &&
          specificBehavioursByStatus[responseStatus]?.[errCode];

        if (maybeSpecificErrorBehaviour != null) {
          const { track: expectedTrack, Component: expectedComponent } =
            maybeSpecificErrorBehaviour;
          it(`should return ${expectedComponent.name} for ${responseStatus} + ${errCode} and track the correct event`, () => {
            const { Component, track } = getAarErrorBehaviour(
              makeProblemJson(errCode, responseStatus)
            );
            expect(Component).toBe(expectedComponent);

            expect(expectedTrack).not.toHaveBeenCalled();
            track("reason");
            expect(expectedTrack).toHaveBeenCalledTimes(1);
          });
        } else if (errCode in cieErrors) {
          it(`should return GenericCieValidationErrorComponent and track the correct event for ${responseStatus} status and CIE errorCode ${errCode}`, () => {
            const { Component, track } = getAarErrorBehaviour(
              makeProblemJson(errCode, responseStatus)
            );
            expect(Component).toBe(GenericCieValidationErrorComponent);
            expect(trackSendAarMandateCieDataError).not.toHaveBeenCalled();
            track("reason");
            expect(trackSendAarMandateCieDataError).toHaveBeenCalledWith(
              "reason"
            );
          });
        } else {
          it(`should return SendAarGenericErrorComponent for  ${responseStatus} + non-CIE code ${errCode}`, () => {
            const { Component } = getAarErrorBehaviour(
              makeProblemJson(errCode, responseStatus)
            );
            expect(Component).toBe(SendAarGenericErrorComponent);
          });
        }
      });
      it.each(["ANY_ERROR_CODE", "NOT_A_CIE_ERROR", "UNKNOWN_SERVER_ERROR"])(
        `should return SendAarGenericErrorComponent for  ${responseStatus} + invalid error code "%s"`,
        errorCode => {
          const { Component } = getAarErrorBehaviour(
            makeProblemJson(errorCode, responseStatus)
          );
          expect(Component).toBe(SendAarGenericErrorComponent);
        }
      );

      it.each([
        {
          name: `problemJson with undefined errors array and status ${responseStatus}`,
          problemJson: { status: responseStatus, detail: "A detail" }
        },
        {
          name: `problemJson with empty errors array and status ${responseStatus}`,
          problemJson: {
            status: responseStatus as 599,
            detail: "A detail",
            errors: [] as Array<{ code: string }>
          }
        }
      ] as Array<{ name: string; problemJson: AARProblemJson | undefined }>)(
        "should return SendAarGenericErrorComponent when called with a $name",
        ({ problemJson }) => {
          const { Component } = getAarErrorBehaviour(problemJson);
          expect(Component).toBe(SendAarGenericErrorComponent);
        }
      );
    });

    it("should return SendAarGenericErrorComponent when called with an undefined problemJson", () => {
      const { Component } = getAarErrorBehaviour(undefined);
      expect(Component).toBe(SendAarGenericErrorComponent);
    });

    it.each(["cIe_ExPiReD_eRrOr", "Cie_Expired_Error", "cie_expired_error"])(
      "should be case-insensitive for mixed-case error code %s",
      code => {
        const { Component } = getAarErrorBehaviour(makeProblemJson(code, 422));
        expect(Component).toBe(CieExpiredComponent);
      }
    );
  });
  describe("isAarAttachmentTtlError", () => {
    it("should return true for PN_DELIVERY_MANDATENOTFOUND", () => {
      expect(isAarAttachmentTtlError("PN_DELIVERY_MANDATENOTFOUND")).toBe(true);
    });

    it("should return false for undefined", () => {
      expect(isAarAttachmentTtlError(undefined)).toBe(false);
    });

    it("should return false for an empty string", () => {
      expect(isAarAttachmentTtlError("")).toBe(false);
    });

    it("should return false for an unrelated error code", () => {
      expect(isAarAttachmentTtlError("SOME_OTHER_ERROR")).toBe(false);
    });

    it("should return false for a CIE error code", () => {
      expect(isAarAttachmentTtlError("CIE_EXPIRED_ERROR")).toBe(false);
    });
  });
});
