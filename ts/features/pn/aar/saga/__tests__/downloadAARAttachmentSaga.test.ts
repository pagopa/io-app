import * as E from "fp-ts/lib/Either";
import ReactNativeBlobUtil from "react-native-blob-util";
import { testSaga } from "redux-saga-test-plan";
import { ServiceId } from "../../../../../../definitions/backend/ServiceId";
import { ThirdPartyAttachment } from "../../../../../../definitions/backend/ThirdPartyAttachment";
import { isPnTestEnabledSelector } from "../../../../../store/reducers/persistedPreferences";
import { withRefreshApiCall } from "../../../../authentication/fastLogin/saga/utils";
import { KeyInfo } from "../../../../lollipop/utils/crypto";
import { downloadAttachment } from "../../../../messages/store/actions";
import { unknownToReason } from "../../../../messages/utils";
import * as attachmentsUtils from "../../../../messages/utils/attachments";
import * as analytics from "../../analytics";
import * as client from "../../api/client";
import {
  downloadAARAttachmentSaga,
  testable
} from "../downloadAARAttachmentSaga";

// Mock external dependencies
const mockRNBUFetch = jest.fn();

jest.mock("../../../../messages/utils");
jest.mock("react-native-blob-util", () => ({
  config: jest.fn().mockImplementation(() => ({
    fetch: mockRNBUFetch
  }))
}));

const bearerToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";
const keyInfo: KeyInfo = {
  keyTag: "a12e9221-c056-4bbc-8623-ca92df29361e",
  publicKey: {
    crv: "P-256",
    x: "dyLTwacs5ej/nnXIvCMexUBkmdh6ArJ4GPKjHob61mE=",
    kty: "EC",
    y: "Tz0xNv++cOeLVapU/BhBS0FJydIcNcV25/ALb1HVu+s="
  },
  publicKeyThumbprint: "w24n4sygj6zH-wLh0kGoQSl6QzA_LSQNRuKLUuJMYdo"
};
const mandateId = "13e9ceaa-01a5-4bbd-b0c9-c9d23b0b2860";
const messageId = "01K6YRCNHEBRAG1ST9KZHKJSQ2";
const attachmentUrl =
  "/delivery/notifications/received/SEND-SEND-SEND-000002-A-0/attachments/payment/F24?attachmentIdx=0";
const attachment = {
  id: "1",
  name: "attachment.pdf",
  url: attachmentUrl
} as ThirdPartyAttachment;
const encodedUrl =
  "ZGVsaXZlcnkvbm90aWZpY2F0aW9ucy9yZWNlaXZlZC9TRU5ELVNFTkQtU0VORC0wMDAwMDItQS0wL2F0dGFjaG1lbnRzL3BheW1lbnQvRjI0P2F0dGFjaG1lbnRJZHg9MA%3D%3D";

const downloadRequestAction = downloadAttachment.request({
  attachment,
  messageId,
  serviceId: "01K6YRJ2VWPCCF0GYSSTJSD8Y3" as ServiceId,
  skipMixpanelTrackingOnFailure: false
});

describe("downloadAARAttachmentSaga", () => {
  [undefined, mandateId].forEach(mandateIdVariant => {
    [false, true].forEach(useUATEnvironment => {
      const prevalidatedUrl = "https://prevalidated.url/download";
      const attachmentPath = "/path/to/attachment.pdf";
      it(`should handle a successful download (mandateId: ${mandateIdVariant}, UAT environment: ${useUATEnvironment})`, () => {
        testSaga(
          downloadAARAttachmentSaga,
          bearerToken,
          keyInfo,
          mandateIdVariant,
          downloadRequestAction
        )
          .next()
          .select(isPnTestEnabledSelector)
          .next(useUATEnvironment)
          .call(
            testable!.getAttachmentPrevalidatedUrl,
            bearerToken,
            keyInfo,
            attachment.url,
            useUATEnvironment,
            mandateIdVariant,
            downloadRequestAction
          )
          .next(prevalidatedUrl)
          .call(
            testable!.downloadAttachmentFromPrevalidatedUrl,
            attachment,
            messageId,
            prevalidatedUrl
          )
          .next(attachmentPath)
          .put(
            downloadAttachment.success({
              attachment,
              messageId,
              path: attachmentPath
            })
          )
          .next()
          .cancelled()
          .next(false)
          .isDone();
      });
      it(`should handle a download failure (mandateId: ${mandateIdVariant}, UAT environment: ${useUATEnvironment})`, () => {
        const error = new Error("Download failed");
        const reason = "Download failed";
        (unknownToReason as jest.Mock).mockReturnValue(reason);

        testSaga(
          downloadAARAttachmentSaga,
          bearerToken,
          keyInfo,
          mandateId,
          downloadRequestAction
        )
          .next()
          .select(isPnTestEnabledSelector)
          .next(useUATEnvironment)
          .call(
            testable!.getAttachmentPrevalidatedUrl,
            bearerToken,
            keyInfo,
            attachment.url,
            useUATEnvironment,
            mandateId,
            downloadRequestAction
          )
          .throw(error)
          .call(analytics.trackSendAARFailure, "Download Attachment", reason)
          .next()
          .put(
            downloadAttachment.failure({
              attachment,
              messageId,
              error: new Error(reason)
            })
          )
          .next()
          .cancelled()
          .next(false)
          .isDone();
      });
      it(`should handle cancellation (mandateId: ${mandateIdVariant}, UAT environment: ${useUATEnvironment})`, () => {
        testSaga(
          downloadAARAttachmentSaga,
          bearerToken,
          keyInfo,
          mandateId,
          downloadRequestAction
        )
          .next()
          .select(isPnTestEnabledSelector)
          .next(useUATEnvironment)
          .call(
            testable!.getAttachmentPrevalidatedUrl,
            bearerToken,
            keyInfo,
            attachment.url,
            useUATEnvironment,
            mandateId,
            downloadRequestAction
          )
          .next(prevalidatedUrl)
          .call(
            testable!.downloadAttachmentFromPrevalidatedUrl,
            attachment,
            messageId,
            prevalidatedUrl
          )
          .next(attachmentPath)
          .put(
            downloadAttachment.success({
              attachment,
              messageId,
              path: attachmentPath
            })
          )
          .next()
          .cancelled()
          .next(true) // Simulate cancellation
          .put(downloadAttachment.cancel({ attachment, messageId }))
          .next()
          .isDone();
      });
    });
  });
});

describe("getAttachmentPrevalidatedUrl", () => {
  [undefined, mandateId].forEach(mandateIdVariant => {
    [false, true].forEach(useUATEnvironment => {
      it(`should return URL immediately if available (mandateId: ${mandateIdVariant}, UAT environment: ${useUATEnvironment})`, () => {
        const url = "https://some.url";
        testSaga(
          testable!.getAttachmentPrevalidatedUrl,
          bearerToken,
          keyInfo,
          attachment.url,
          useUATEnvironment,
          mandateIdVariant,
          downloadRequestAction
        )
          .next()
          .call(
            testable!.getAttachmentMetadata,
            bearerToken,
            keyInfo,
            attachment.url,
            useUATEnvironment,
            mandateIdVariant,
            downloadRequestAction
          )
          .next(url)
          .returns(url)
          .next()
          .isDone();
      });

      it(`should retry after a delay if retryAfter is provided (mandateId: ${mandateIdVariant}, UAT environment: ${useUATEnvironment})`, () => {
        const retryAfter = 5;
        const retryAfterMs = 5000;
        const url = "https://some.url";

        testSaga(
          testable!.getAttachmentPrevalidatedUrl,
          bearerToken,
          keyInfo,
          attachment.url,
          useUATEnvironment,
          mandateIdVariant,
          downloadRequestAction
        )
          .next()
          .call(
            testable!.getAttachmentMetadata,
            bearerToken,
            keyInfo,
            attachment.url,
            useUATEnvironment,
            mandateIdVariant,
            downloadRequestAction
          )
          .next(retryAfter)
          .call(
            attachmentsUtils.restrainRetryAfterIntervalInMilliseconds,
            retryAfter
          )
          .next(retryAfterMs)
          .delay(retryAfterMs)
          .next()
          .call(
            testable!.getAttachmentMetadata,
            bearerToken,
            keyInfo,
            attachment.url,
            useUATEnvironment,
            mandateIdVariant,
            downloadRequestAction
          )
          .next(url)
          .returns(url)
          .next()
          .isDone();
      });
    });
  });
});

describe("getAttachmentMetadata", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  [undefined, mandateId].forEach(mandateIdVariant => {
    [false, true].forEach(useUATEnvironment => {
      it(`should return url on successful response (mandateId: ${mandateIdVariant} isUAT: ${useUATEnvironment})`, () => {
        const response = E.right({
          status: 200,
          value: {
            url: "https://success.url"
          }
        });
        const {
          mockedGetNotificationAttachment,
          mockedGetNotificationAttachmentInput
        } = generateMocks(response);
        testSaga(
          testable!.getAttachmentMetadata,
          bearerToken,
          keyInfo,
          attachment.url,
          useUATEnvironment,
          mandateIdVariant,
          downloadRequestAction
        )
          .next()
          .call(
            withRefreshApiCall,
            mockedGetNotificationAttachment,
            downloadRequestAction
          )
          .next(response)
          .returns("https://success.url")
          .next()
          .isDone();
        expect(mockedGetNotificationAttachmentInput.mock.calls.length).toBe(1);
        expect(mockedGetNotificationAttachmentInput.mock.calls[0].length).toBe(
          1
        );
        expect(mockedGetNotificationAttachmentInput.mock.calls[0][0]).toEqual({
          Bearer: `Bearer ${bearerToken}`,
          urlEncodedBase64AttachmentUrl: encodedUrl,
          "x-pagopa-pn-io-src": "QR_CODE",
          mandateId: mandateIdVariant,
          isTest: useUATEnvironment
        });
      });

      it(`should return retryAfter on successful response (mandateId: ${mandateIdVariant} isUAT: ${useUATEnvironment})`, () => {
        const response = E.right({ status: 200, value: { retryAfter: 10 } });
        const {
          mockedGetNotificationAttachment,
          mockedGetNotificationAttachmentInput
        } = generateMocks(response);
        testSaga(
          testable!.getAttachmentMetadata,
          bearerToken,
          keyInfo,
          attachment.url,
          useUATEnvironment,
          mandateIdVariant,
          downloadRequestAction
        )
          .next()
          .call(
            withRefreshApiCall,
            mockedGetNotificationAttachment,
            downloadRequestAction
          )
          .next(response)
          .returns(10)
          .next()
          .isDone();
        expect(mockedGetNotificationAttachmentInput.mock.calls.length).toBe(1);
        expect(mockedGetNotificationAttachmentInput.mock.calls[0].length).toBe(
          1
        );
        expect(mockedGetNotificationAttachmentInput.mock.calls[0][0]).toEqual({
          Bearer: `Bearer ${bearerToken}`,
          urlEncodedBase64AttachmentUrl: encodedUrl,
          "x-pagopa-pn-io-src": "QR_CODE",
          mandateId: mandateIdVariant,
          isTest: useUATEnvironment
        });
      });
      it(`should throw on API deconding error (mandateId: ${mandateIdVariant} isUAT: ${useUATEnvironment})`, () => {
        const response = E.left([
          {
            value: "error",
            message: "error",
            context: []
          }
        ]);
        const {
          mockedGetNotificationAttachment,
          mockedGetNotificationAttachmentInput
        } = generateMocks(response);
        // eslint-disable-next-line functional/no-let
        let expectionThrown = false;
        try {
          testSaga(
            testable!.getAttachmentMetadata,
            bearerToken,
            keyInfo,
            attachment.url,
            useUATEnvironment,
            mandateIdVariant,
            downloadRequestAction
          )
            .next()
            .call(
              withRefreshApiCall,
              mockedGetNotificationAttachment,
              downloadRequestAction
            )
            .next(response);
        } catch (e: unknown) {
          expectionThrown = true;
          expect(e).toEqual(
            Error(`Decoding failure (value "error" at root (decoder info n/a))`)
          );
        }
        expect(expectionThrown).toBe(true);
        expect(mockedGetNotificationAttachmentInput.mock.calls.length).toBe(1);
        expect(mockedGetNotificationAttachmentInput.mock.calls[0].length).toBe(
          1
        );
        expect(mockedGetNotificationAttachmentInput.mock.calls[0][0]).toEqual({
          Bearer: `Bearer ${bearerToken}`,
          urlEncodedBase64AttachmentUrl: encodedUrl,
          "x-pagopa-pn-io-src": "QR_CODE",
          mandateId: mandateIdVariant,
          isTest: useUATEnvironment
        });
      });
      it(`should throw on non-200 response (mandateId: ${mandateIdVariant} isUAT: ${useUATEnvironment})`, () => {
        const response = E.right({
          status: 500,
          value: {
            status: 401,
            title: "Access denied",
            detail: "Remote server has denied access. Check your API key"
          }
        });
        const {
          mockedGetNotificationAttachment,
          mockedGetNotificationAttachmentInput
        } = generateMocks(response);
        // eslint-disable-next-line functional/no-let
        let expectionThrown = false;
        try {
          testSaga(
            testable!.getAttachmentMetadata,
            bearerToken,
            keyInfo,
            attachment.url,
            useUATEnvironment,
            mandateIdVariant,
            downloadRequestAction
          )
            .next()
            .call(
              withRefreshApiCall,
              mockedGetNotificationAttachment,
              downloadRequestAction
            )
            .next(response);
        } catch (e: unknown) {
          expectionThrown = true;
          expect(e).toEqual(
            Error(
              `HTTP request failed (500 401 Access denied Remote server has denied access. Check your API key)`
            )
          );
        }
        expect(expectionThrown).toBe(true);
        expect(mockedGetNotificationAttachmentInput.mock.calls.length).toBe(1);
        expect(mockedGetNotificationAttachmentInput.mock.calls[0].length).toBe(
          1
        );
        expect(mockedGetNotificationAttachmentInput.mock.calls[0][0]).toEqual({
          Bearer: `Bearer ${bearerToken}`,
          urlEncodedBase64AttachmentUrl: encodedUrl,
          "x-pagopa-pn-io-src": "QR_CODE",
          mandateId: mandateIdVariant,
          isTest: useUATEnvironment
        });
      });
      it(`should throw if both url and retryAfter are invalid (mandateId: ${mandateIdVariant} isUAT: ${useUATEnvironment})`, () => {
        const response = E.right({ status: 200, value: {} });
        const {
          mockedGetNotificationAttachment,
          mockedGetNotificationAttachmentInput
        } = generateMocks(response);
        // eslint-disable-next-line functional/no-let
        let expectionThrown = false;
        try {
          testSaga(
            testable!.getAttachmentMetadata,
            bearerToken,
            keyInfo,
            attachment.url,
            useUATEnvironment,
            mandateIdVariant,
            downloadRequestAction
          )
            .next()
            .call(
              withRefreshApiCall,
              mockedGetNotificationAttachment,
              downloadRequestAction
            )
            .next(response);
        } catch (e: unknown) {
          expectionThrown = true;
          expect(e).toEqual(
            Error(
              `Both 'retryAfter' and 'url' fields are missing or invalid (undefined) (undefined)`
            )
          );
        }
        expect(expectionThrown).toBe(true);
        expect(mockedGetNotificationAttachmentInput.mock.calls.length).toBe(1);
        expect(mockedGetNotificationAttachmentInput.mock.calls[0].length).toBe(
          1
        );
        expect(mockedGetNotificationAttachmentInput.mock.calls[0][0]).toEqual({
          Bearer: `Bearer ${bearerToken}`,
          urlEncodedBase64AttachmentUrl: encodedUrl,
          "x-pagopa-pn-io-src": "QR_CODE",
          mandateId: mandateIdVariant,
          isTest: useUATEnvironment
        });
      });
      it(`should throw FAST_LOGIN_EXPIRED and call trackSendAARFailure with 'Fast login expiration' on 401 response (mandateId: ${mandateIdVariant} isUAT: ${useUATEnvironment})`, () => {
        const response = E.right({
          status: 401,
          value: {
            status: 401,
            title: "Unauthorized",
            detail: "Your session has expired"
          }
        });

        const {
          mockedGetNotificationAttachment,
          mockedGetNotificationAttachmentInput
        } = generateMocks(response);

        // eslint-disable-next-line functional/no-let
        let expectionThrown = false;
        try {
          testSaga(
            testable!.getAttachmentMetadata,
            bearerToken,
            keyInfo,
            attachment.url,
            useUATEnvironment,
            mandateIdVariant,
            downloadRequestAction
          )
            .next()
            .call(
              withRefreshApiCall,
              mockedGetNotificationAttachment,
              downloadRequestAction
            )
            .next(response)
            .call(
              analytics.trackSendAARFailure,
              "Download Attachment",
              "Fast login expired"
            );
        } catch (e: unknown) {
          expectionThrown = true;
          expect(e).toEqual(new Error("FAST_LOGIN_EXPIRED"));
        }

        expect(expectionThrown).toBe(true);
        expect(mockedGetNotificationAttachmentInput.mock.calls.length).toBe(1);
        expect(mockedGetNotificationAttachmentInput.mock.calls[0][0]).toEqual({
          Bearer: `Bearer ${bearerToken}`,
          urlEncodedBase64AttachmentUrl: encodedUrl,
          "x-pagopa-pn-io-src": "QR_CODE",
          mandateId: mandateIdVariant,
          isTest: useUATEnvironment
        });
      });
    });
  });
});

describe("encodeAttachmentUrl", () => {
  it("should correctly encode an URL with an initial slash", () => {
    const output = testable!.encodeAttachmentUrl(attachmentUrl);
    expect(output).toBe(encodedUrl);
  });
  it("should correctly encode an URL without an initial slash", () => {
    const attachmentUrlNoSlash =
      "delivery/notifications/received/SEND-SEND-SEND-000002-A-0/attachments/documents/0";
    const urlEncodedBase64AttachmetnUrlNoSlash =
      "ZGVsaXZlcnkvbm90aWZpY2F0aW9ucy9yZWNlaXZlZC9TRU5ELVNFTkQtU0VORC0wMDAwMDItQS0wL2F0dGFjaG1lbnRzL2RvY3VtZW50cy8w";
    const output = testable!.encodeAttachmentUrl(attachmentUrlNoSlash);
    expect(output).toBe(urlEncodedBase64AttachmetnUrlNoSlash);
  });
});

describe("downloadAttachmentFromPrevalidatedUrl", () => {
  const prevalidatedUrl = "https://prevalidated.url/download";
  const savePath = "/path/to/save/attachment.pdf";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the path on successful download", () => {
    const fakeConfigFetch = (_method: string, _url: string) => undefined;
    const spiedOnAttachmentsUtils = jest.spyOn(
      attachmentsUtils,
      "attachmentDisplayName"
    );
    const spiedOnPdfSavePath = jest
      .spyOn(attachmentsUtils, "pdfSavePath")
      .mockReturnValue(savePath);

    testSaga(
      testable!.downloadAttachmentFromPrevalidatedUrl,
      attachment,
      messageId,
      prevalidatedUrl
    )
      .next()
      .call(ReactNativeBlobUtil.config, { path: savePath, timeout: 8000 })
      .next({ fetch: fakeConfigFetch })
      .call(fakeConfigFetch, "get", prevalidatedUrl)
      .next({ info: () => ({ status: 200 }), path: () => savePath })
      .returns(savePath)
      .next()
      .isDone();

    expect(spiedOnAttachmentsUtils.mock.calls.length).toBe(1);
    expect(spiedOnAttachmentsUtils.mock.calls[0].length).toBe(1);
    expect(spiedOnAttachmentsUtils.mock.calls[0][0]).toEqual(attachment);

    expect(spiedOnPdfSavePath.mock.calls.length).toBe(1);
    expect(spiedOnPdfSavePath.mock.calls[0].length).toBe(3);
    expect(spiedOnPdfSavePath.mock.calls[0][0]).toBe(messageId);
    expect(spiedOnPdfSavePath.mock.calls[0][1]).toBe(attachment.id);
    expect(spiedOnPdfSavePath.mock.calls[0][2]).toBe(attachment.name);
  });

  [false, true].forEach(isTimeout => {
    ["", "text", "blob", "json"].forEach(respType => {
      it(`should throw an error on download failure (timeout: ${isTimeout} responseType: ${respType})`, () => {
        const fakeConfigFetch = (_method: string, _url: string) => undefined;
        const spiedOnAttachmentsUtils = jest.spyOn(
          attachmentsUtils,
          "attachmentDisplayName"
        );
        const spiedOnPdfSavePath = jest
          .spyOn(attachmentsUtils, "pdfSavePath")
          .mockReturnValue(savePath);

        // eslint-disable-next-line functional/no-let
        let expectionThrown = false;
        try {
          testSaga(
            testable!.downloadAttachmentFromPrevalidatedUrl,
            attachment,
            messageId,
            prevalidatedUrl
          )
            .next()
            .call(ReactNativeBlobUtil.config, { path: savePath, timeout: 8000 })
            .next({ fetch: fakeConfigFetch })
            .call(fakeConfigFetch, "get", prevalidatedUrl)
            .next({
              info: () => ({
                status: 500,
                state: "A state",
                timeout: isTimeout,
                respType
              })
            });
        } catch (e: unknown) {
          expectionThrown = true;
          expect(e).toEqual(
            Error(
              `Download from prevalidated url failed: ${
                isTimeout ? "Timeout " : ""
              }500 A state ${respType}`
            )
          );
        }

        expect(expectionThrown).toBe(true);

        expect(spiedOnAttachmentsUtils.mock.calls.length).toBe(1);
        expect(spiedOnAttachmentsUtils.mock.calls[0].length).toBe(1);
        expect(spiedOnAttachmentsUtils.mock.calls[0][0]).toEqual(attachment);

        expect(spiedOnPdfSavePath.mock.calls.length).toBe(1);
        expect(spiedOnPdfSavePath.mock.calls[0].length).toBe(3);
        expect(spiedOnPdfSavePath.mock.calls[0][0]).toBe(messageId);
        expect(spiedOnPdfSavePath.mock.calls[0][1]).toBe(attachment.id);
        expect(spiedOnPdfSavePath.mock.calls[0][2]).toBe(attachment.name);
      });
    });
  });
});

const generateMocks = (response: E.Either<unknown, unknown>) => {
  const mockedGetNotificationAttachment = Promise.resolve(response);
  const mockedGetNotificationAttachmentInput = jest.fn();
  jest.spyOn(client, "createSendAARClientWithLollipop").mockImplementation(
    (_baseUrl, _keyInfo) =>
      ({
        getNotificationAttachment: (input: unknown) => {
          mockedGetNotificationAttachmentInput(input);
          return mockedGetNotificationAttachment;
        }
      } as any)
  );
  return {
    mockedGetNotificationAttachment,
    mockedGetNotificationAttachmentInput
  };
};
