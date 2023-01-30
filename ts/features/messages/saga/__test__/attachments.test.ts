import ReactNativeBlobUtil from "react-native-blob-util";
import { expectSaga } from "redux-saga-test-plan";
import I18n from "../../../../i18n";
import { downloadAttachmentSaga } from "../networking/downloadAttachment";
import { SessionToken } from "../../../../types/SessionToken";
import { downloadAttachment } from "../../../../store/actions/messages";
import { mockPdfAttachment } from "../../../../__mocks__/attachment";
import { ServiceId } from "../../../../../definitions/backend/ServiceId";

const savePath = "/tmp/attachment.pdf";
const serviceId = "service0000001" as ServiceId;

jest.mock("../../../../store/reducers/entities/messages/paginatedById", () => ({
  getServiceByMessageId: jest.fn().mockReturnValue(serviceId)
}));

describe("downloadAttachment", () => {
  describe("given an attachment", () => {
    const attachment = mockPdfAttachment;

    describe("when a download request succeeds", () => {
      beforeAll(() => {
        // eslint-disable-next-line functional/immutable-data
        (ReactNativeBlobUtil as any).config = jest.fn(() => ({
          fetch: jest.fn().mockReturnValue({
            info: jest.fn().mockReturnValue({ status: 200 }),
            path: jest.fn().mockReturnValue(savePath)
          })
        }));
      });

      it("then it puts a success action with the path of the saved attachment", () =>
        expectSaga(
          downloadAttachmentSaga,
          "token" as SessionToken,
          downloadAttachment.request(attachment)
        )
          .put(
            downloadAttachment.success({
              attachment,
              path: savePath
            })
          )
          .run());
    });

    describe("when a download request generically fails", () => {
      const status = 404;

      beforeAll(() => {
        // eslint-disable-next-line functional/immutable-data
        (ReactNativeBlobUtil as any).config = jest.fn(() => ({
          fetch: jest.fn().mockReturnValue({
            info: jest.fn().mockReturnValue({ status })
          })
        }));
      });

      it("then it puts a failure action with the generic error message", () =>
        expectSaga(
          downloadAttachmentSaga,
          "token" as SessionToken,
          downloadAttachment.request(attachment)
        )
          .put(
            downloadAttachment.failure({
              attachment,
              error: new Error(
                I18n.t("messageDetails.attachments.downloadFailed")
              )
            })
          )
          .run());
    });

    describe("when a download request fails for a bad file format", () => {
      const status = 415;

      // eslint-disable-next-line sonarjs/no-identical-functions
      beforeAll(() => {
        // eslint-disable-next-line functional/immutable-data, sonarjs/no-identical-functions
        (ReactNativeBlobUtil as any).config = jest.fn(() => ({
          fetch: jest.fn().mockReturnValue({
            info: jest.fn().mockReturnValue({ status })
          })
        }));
      });

      it("then it puts a failure action with the file format error", () =>
        expectSaga(
          downloadAttachmentSaga,
          "token" as SessionToken,
          downloadAttachment.request(attachment)
        )
          .put(
            downloadAttachment.failure({
              attachment,
              error: new Error(I18n.t("messageDetails.attachments.badFormat"))
            })
          )
          .run());
    });
  });
});
