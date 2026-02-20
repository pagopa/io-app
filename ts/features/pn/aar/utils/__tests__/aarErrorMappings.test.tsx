import * as GENERIC_ERROR from "../../components/errors/SendAARErrorComponent";
import {
  getSendAarErrorComponent,
  isAarAttachmentTtlError,
  testable
} from "../aarErrorMappings";

const errorMap = testable!.aarProblemJsonComponentMap;

describe("aarErrorMappings", () => {
  const genericErrorSpy = jest
    .spyOn(GENERIC_ERROR, "SendAarGenericErrorComponent")
    .mockImplementation(() => <></>);
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getSendAarErrorComponent", () => {
    describe("Generic Error Component Cases", () => {
      test.each([
        {
          title:
            "should return generic error component when errors is undefined",
          errors: undefined
        },
        {
          title:
            "should return generic error component when errors is an empty array",
          errors: []
        },
        {
          title:
            "should return generic error component when called with a single unknown error code",
          errors: [{ code: "UNKNOWN_ERROR_CODE" }]
        },
        {
          title:
            "should return generic error component when called with multiple unknown error codes",
          errors: [
            { code: "UNKNOWN_ERROR_CODE_1" },
            { code: "UNKNOWN_ERROR_CODE_2" }
          ]
        }
      ])("$title", ({ errors }) => {
        const component = getSendAarErrorComponent(errors);
        expect(component).toBeDefined();
        expect(component).toBe(genericErrorSpy);
      });
    });

    Object.entries(errorMap).forEach(([errorCode, component]) => {
      it(`should return the correct component for error code ${errorCode}`, () => {
        const result = getSendAarErrorComponent([{ code: errorCode }]);
        expect(result).toBeDefined();
        expect(result).toBe(component);
      });
      it(`should return the first matching component when
         multiple error codes are provided before ${errorCode}`, () => {
        const precedingUnknownErrors = [
          { code: "UNKNOWN_ERROR_CODE_1" },
          { code: "UNKNOWN_ERROR_CODE_2" }
        ];
        const result = getSendAarErrorComponent([
          ...precedingUnknownErrors,
          { code: errorCode }
        ]);
        expect(result).toBeDefined();
        expect(result).toBe(component);
      });
      it(`should return the first matching component when multiple valid error codes are provided after ${errorCode}`, () => {
        const followingKnownErrors = Object.keys(errorMap)
          .filter(code => code !== errorCode)
          .map(code => ({ code }));
        const result = getSendAarErrorComponent([
          { code: errorCode },
          ...followingKnownErrors
        ]);
        expect(result).toBeDefined();
        expect(result).toBe(component);
      });
    });

    describe("isAarAttachmentTtlError", () => {
      it("should return true for PN_DELIVERY_MANDATENOTFOUND", () => {
        expect(isAarAttachmentTtlError("PN_DELIVERY_MANDATENOTFOUND")).toBe(
          true
        );
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
});
