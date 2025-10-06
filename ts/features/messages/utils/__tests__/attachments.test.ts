import { pdfSavePath } from "../attachments";

jest.mock("react-native-fs", () => ({
  get CachesDirectoryPath() {
    return "";
  }
}));

const messageId = "01JTT75QYSHWBTNTFM3CZZ17SH";

describe("attachments", () => {
  describe("pdfSavePath function", () => {
    it("should correctly format the save path for regular pdf filename (lowercase)", () => {
      const path = pdfSavePath(messageId, "att123", "document.pdf");
      expect(path).toBe(`/attachments/${messageId}/att123/document.pdf`);
    });
    it("should correctly format the save path for regular pdf filename (uppercsae)", () => {
      const path = pdfSavePath(messageId, "att123", "document.PDF");
      expect(path).toBe(`/attachments/${messageId}/att123/document.PDF`);
    });
    it("should correctly format the save path for regular pdf filename (mixedcase)", () => {
      const path = pdfSavePath(messageId, "att123", "document.PdF");
      expect(path).toBe(`/attachments/${messageId}/att123/document.PdF`);
    });
    it("should add .pdf extension if missing", () => {
      const path = pdfSavePath(messageId, "att123", "document");
      expect(path).toBe(`/attachments/${messageId}/att123/document.pdf`);
    });
    it("should sanitize invalid filename characters", () => {
      const path = pdfSavePath(
        messageId,
        "att123",
        ' d\\oc/u*m:e"n<t?.p>d|f  '
      );
      expect(path).toBe(`/attachments/${messageId}/att123/document.pdf`);
    });
  });
});
