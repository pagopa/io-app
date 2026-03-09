import { ThirdPartyAttachment } from "../../../../../definitions/backend/ThirdPartyAttachment";
import {
  attachmentContentType,
  attachmentDisplayName,
  attachmentDownloadUrl,
  getHeaderValueByKey,
  pdfSavePath,
  restrainRetryAfterIntervalInMilliseconds
} from "../attachments";

jest.mock("react-native-fs", () => ({
  get CachesDirectoryPath() {
    return "";
  }
}));

jest.mock("../../../../config", () => ({
  apiUrlPrefix: ""
}));

const messageId = "01JTT75QYSHWBTNTFM3CZZ17SH";

describe("attachments", () => {
  describe("pdfSavePath function", () => {
    it("should correctly format the save path for regular pdf filename (lowercase)", () => {
      const path = pdfSavePath(messageId, "att123", "document.pdf");
      expect(path).toBe(`/attachments/${messageId}/att123/document.pdf`);
    });
    it("should correctly format the save path for regular pdf filename (uppercase)", () => {
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
    it("should sanitize invalid filename characters and use default naming when empty", () => {
      const path = pdfSavePath(messageId, "att123", ' \\/*:"<?>|  ');
      expect(path).toBe(`/attachments/${messageId}/att123/document.pdf`);
    });
  });
  describe("getHeaderValueByKey", () => {
    it("should return the value for a key present in the headers (case-insensitive)", () => {
      const headers = { "Content-Type": "application/json" };
      const value = getHeaderValueByKey(headers, "content-type");
      expect(value).toBe("application/json");
    });
    it("should return the value for a key present in the headers", () => {
      const headers = { "Content-Type": "application/json" };
      const value = getHeaderValueByKey(headers, "Content-Type");
      expect(value).toBe("application/json");
    });
    it("should return undefined for a key not present in the headers", () => {
      const headers = { "Content-Type": "application/json" };
      const value = getHeaderValueByKey(headers, "X-Custom-Header");
      expect(value).toBeUndefined();
    });
    it("should return undefined for an empty headers object", () => {
      const headers = {};
      const value = getHeaderValueByKey(headers, "Content-Type");
      expect(value).toBeUndefined();
    });
  });

  describe("restrainRetryAfterIntervalInMilliseconds", () => {
    const upperBoundSeconds = 24;
    const upperBoundMilliseconds = upperBoundSeconds * 1000;

    it("should convert seconds to milliseconds if within bounds", () => {
      const milliseconds = restrainRetryAfterIntervalInMilliseconds(
        10,
        upperBoundSeconds
      );
      expect(milliseconds).toBe(10000);
    });
    it("should return the input if it is in milliseconds and within bounds", () => {
      const milliseconds = restrainRetryAfterIntervalInMilliseconds(
        15000,
        upperBoundSeconds
      );
      expect(milliseconds).toBe(15000);
    });
    it("should cap the value to the upper bound if input in seconds is too high", () => {
      const milliseconds = restrainRetryAfterIntervalInMilliseconds(
        30,
        upperBoundSeconds
      );
      expect(milliseconds).toBe(upperBoundMilliseconds);
    });
    it("should cap the value to the upper bound if input in milliseconds is too high", () => {
      const milliseconds = restrainRetryAfterIntervalInMilliseconds(
        30000,
        upperBoundSeconds
      );
      expect(milliseconds).toBe(upperBoundMilliseconds);
    });
    it("should cap the value to the upper bound for negative inputs", () => {
      const milliseconds = restrainRetryAfterIntervalInMilliseconds(
        -5,
        upperBoundSeconds
      );
      expect(milliseconds).toBe(upperBoundMilliseconds);
    });
    it("should handle zero input correctly", () => {
      const milliseconds = restrainRetryAfterIntervalInMilliseconds(
        0,
        upperBoundSeconds
      );
      expect(milliseconds).toBe(0);
    });
    it("should handle edge case where input is exactly the upper bound in seconds", () => {
      const milliseconds = restrainRetryAfterIntervalInMilliseconds(
        upperBoundSeconds,
        upperBoundSeconds
      );
      expect(milliseconds).toBe(upperBoundMilliseconds);
    });
    it("should handle edge case where input is exactly the upper bound in milliseconds", () => {
      const milliseconds = restrainRetryAfterIntervalInMilliseconds(
        upperBoundMilliseconds,
        upperBoundSeconds
      );
      expect(milliseconds).toBe(upperBoundMilliseconds);
    });
    it("should use default upper bound if not provided", () => {
      const milliseconds = restrainRetryAfterIntervalInMilliseconds(30);
      expect(milliseconds).toBe(24000);
    });
  });

  describe("attachmentDisplayName", () => {
    it("should return the attachment name if it exists", () => {
      const attachment = {
        id: "1",
        name: "Test Attachment"
      } as ThirdPartyAttachment;
      const name = attachmentDisplayName(attachment);
      expect(name).toBe("Test Attachment");
    });
    it("should return the attachment id if name is not provided", () => {
      const attachment = { id: "1" } as ThirdPartyAttachment;
      const name = attachmentDisplayName(attachment);
      expect(name).toBe("1");
    });
    it("should return the attachment id if name is null", () => {
      const attachment = {
        id: "1",
        name: null
      } as unknown as ThirdPartyAttachment;
      const name = attachmentDisplayName(attachment);
      expect(name).toBe("1");
    });
  });

  describe("attachmentContentType", () => {
    it("should return the content_type if it exists", () => {
      const attachment = {
        content_type: "application/pdf"
      } as ThirdPartyAttachment;
      const contentType = attachmentContentType(attachment);
      expect(contentType).toBe("application/pdf");
    });
    it("should return a default content type if not provided", () => {
      const attachment = {} as ThirdPartyAttachment;
      const contentType = attachmentContentType(attachment);
      expect(contentType).toBe("application/octet-stream");
    });
    it("should return a default content type if content_type is null", () => {
      const attachment = {
        content_type: null
      } as unknown as ThirdPartyAttachment;
      const contentType = attachmentContentType(attachment);
      expect(contentType).toBe("application/octet-stream");
    });
  });

  describe("attachmentDownloadUrl", () => {
    it("should construct the download URL correctly", () => {
      const attachment = { url: "some/path" } as ThirdPartyAttachment;
      const expectedUrl = `/api/v1/third-party-messages/${messageId}/attachments/some/path`;
      const url = attachmentDownloadUrl(messageId, attachment);
      expect(url).toBe(expectedUrl);
    });
    it("should strip leading slash from attachment url", () => {
      const attachment = { url: "/some/path" } as ThirdPartyAttachment;
      const expectedUrl = `/api/v1/third-party-messages/${messageId}/attachments/some/path`;
      const url = attachmentDownloadUrl(messageId, attachment);
      expect(url).toBe(expectedUrl);
    });
  });
});
