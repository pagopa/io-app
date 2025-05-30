import ReactNativeBlobUtil from "react-native-blob-util";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import * as O from "fp-ts/lib/Option";
import I18n from "../../../../i18n";
import {
  downloadAttachmentWorker,
  pdfSavePath
} from "../handleDownloadAttachment";
import { SessionToken } from "../../../../types/SessionToken";
import { downloadAttachment } from "../../store/actions";
import { mockPdfAttachment } from "../../__mocks__/attachment";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";
import {
  lollipopKeyTagSelector,
  lollipopPublicKeySelector
} from "../../../lollipop/store/reducers/lollipop";
import { UIMessageId } from "../../types";

const messageId = "01JTT75QYSHWBTNTFM3CZZ17SH" as UIMessageId;
const savePath = "/tmp/attachment.pdf";
const serviceId = "service0000001" as ServiceId;
const someKeyTag = O.some("a12e9221-c056-4bbc-8623-ca92df29361e");
const somePublicKey = O.some({
  crv: "P-256",
  x: "dyLTwacs5ej/nnXIvCMexUBkmdh6ArJ4GPKjHob61mE=",
  kty: "EC",
  y: "Tz0xNv++cOeLVapU/BhBS0FJydIcNcV25/ALb1HVu+s="
});

jest.mock("../../store/reducers/paginatedById", () => ({
  getServiceByMessageId: jest.fn().mockReturnValue(serviceId)
}));

jest.mock("react-native-blob-util", () => ({
  config: jest.fn().mockImplementation(() => ({
    fetch: jest.fn()
  }))
}));

jest.mock("react-native-fs", () => ({
  get CachesDirectoryPath() {
    return "";
  }
}));

describe("downloadAttachment given an attachment", () => {
  const attachment = mockPdfAttachment;

  describe("when a download request succeeds", () => {
    it("then it puts a success action with the path of the saved attachment", () =>
      expectSaga(
        downloadAttachmentWorker,
        "token" as SessionToken,
        downloadAttachment.request({
          attachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      )
        .provide([
          [
            matchers.call.fn(ReactNativeBlobUtil.config),
            {
              fetch: jest.fn().mockReturnValue({
                info: jest.fn().mockReturnValue({ status: 200 }),
                path: jest.fn().mockReturnValue(savePath)
              })
            }
          ],
          [matchers.select(lollipopKeyTagSelector), someKeyTag],
          [matchers.select(lollipopPublicKeySelector), somePublicKey]
        ])
        .put(
          downloadAttachment.success({
            attachment,
            messageId,
            path: savePath
          })
        )
        .run());
  });

  describe("when a download request generically fails", () => {
    it("then it puts a failure action with the generic error message", () =>
      expectSaga(
        downloadAttachmentWorker,
        "token" as SessionToken,
        downloadAttachment.request({
          attachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      )
        .provide([
          [
            matchers.call.fn(ReactNativeBlobUtil.config),
            {
              fetch: jest.fn().mockReturnValue({
                info: jest.fn().mockReturnValue({ status: 404 })
              })
            }
          ],
          [matchers.select(lollipopKeyTagSelector), someKeyTag],
          [matchers.select(lollipopPublicKeySelector), somePublicKey]
        ])
        .put(
          downloadAttachment.failure({
            attachment,
            messageId,
            error: new Error(
              I18n.t("messageDetails.attachments.downloadFailed")
            )
          })
        )
        .run());
  });

  describe("when a download request fails for a bad file format", () => {
    it("then it puts a failure action with the file format error", () =>
      expectSaga(
        downloadAttachmentWorker,
        "token" as SessionToken,
        downloadAttachment.request({
          attachment,
          messageId,
          skipMixpanelTrackingOnFailure: false
        })
      )
        .provide([
          [
            matchers.call.fn(ReactNativeBlobUtil.config),
            {
              fetch: jest.fn().mockReturnValue({
                info: jest.fn().mockReturnValue({ status: 415 })
              })
            }
          ],
          [matchers.select(lollipopKeyTagSelector), someKeyTag],
          [matchers.select(lollipopPublicKeySelector), somePublicKey]
        ])
        .put(
          downloadAttachment.failure({
            attachment,
            messageId,
            error: new Error(I18n.t("messageDetails.attachments.badFormat"))
          })
        )
        .run());
  });
});

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
    const path = pdfSavePath(messageId, "att123", ' d\\oc/u*m:e"n<t?.p>d|f  ');
    expect(path).toBe(`/attachments/${messageId}/att123/document.pdf`);
  });
});
