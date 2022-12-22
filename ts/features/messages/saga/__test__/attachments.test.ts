import ReactNativeBlobUtil from "react-native-blob-util";
import { expectSaga } from "redux-saga-test-plan";
import { cancel, fork } from "typed-redux-saga/macro";
import { downloadAttachmentSaga } from "../networking/downloadAttachment";
import { SessionToken } from "../../../../types/SessionToken";
import { downloadAttachment } from "../../../../store/actions/messages";
import { mockPdfAttachment } from "../../../../__mocks__/attachment";

const savePath = "/tmp/attachment.pdf";

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

    describe("when a download request fails", () => {
      const status = 404;

      beforeAll(() => {
        // eslint-disable-next-line functional/immutable-data
        (ReactNativeBlobUtil as any).config = jest.fn(() => ({
          fetch: jest.fn().mockReturnValue({
            info: jest.fn().mockReturnValue({ status })
          })
        }));
      });

      it("then it puts a failure action with the error", () =>
        expectSaga(
          downloadAttachmentSaga,
          "token" as SessionToken,
          downloadAttachment.request(attachment)
        )
          .put(
            downloadAttachment.failure({
              attachment,
              error: new Error(
                `error ${status} fetching ${attachment.resourceUrl.href}`
              )
            })
          )
          .run());
    });

    describe("when the saga gets cancelled", () => {
      // eslint-disable-next-line sonarjs/no-identical-functions
      beforeAll(() => {
        // eslint-disable-next-line functional/immutable-data,sonarjs/no-identical-functions
        (ReactNativeBlobUtil as any).config = jest.fn(() => ({
          fetch: jest.fn().mockReturnValue({
            info: jest.fn().mockReturnValue({ status: 200 }),
            path: jest.fn().mockReturnValue(savePath)
          })
        }));
      });

      function* saga() {
        const task = yield* fork(
          downloadAttachmentSaga,
          "token" as SessionToken,
          downloadAttachment.request(attachment)
        );
        yield* cancel(task);
      }

      it("then it puts a cancel action", () =>
        expectSaga(saga).put(downloadAttachment.cancel(attachment)).run());
    });
  });
});
