import {
  AarErrorStatesKind,
  getSendAarErrorComponent,
  isAarAttachmentTtlError,
  testable
} from "../aarErrorMappings";

const errorMap = testable.aarProblemJsonComponentMap!;

describe("aarErrorMappings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("getSendAarErrorComponent", () => {
    it.each(Object.keys(AarErrorStatesKind))(
      'should return the correct component for error kind "%s"',
      errorKind => {
        const errorValue =
          AarErrorStatesKind[errorKind as keyof typeof AarErrorStatesKind];
        const Component = getSendAarErrorComponent(errorValue);
        expect(Component).toBe(errorMap[errorValue]);
      }
    );
    it("should return the generic error component for undefined error kind", () => {
      const Component = getSendAarErrorComponent(undefined);
      expect(Component).toBe(errorMap[AarErrorStatesKind.GENERIC]);
    });
    it("should return the generic error component for an unmapped error kind", () => {
      const Component = getSendAarErrorComponent(
        "UNMAPPED ERROR" as AarErrorStatesKind
      );
      expect(Component).toBe(errorMap[AarErrorStatesKind.GENERIC]);
    });
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
