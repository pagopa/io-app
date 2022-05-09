import ReactNativeBlobUtil from "react-native-blob-util";
import { expectSaga, testSaga } from "redux-saga-test-plan";
import * as is from "@redux-saga/is";
import { cancel, fork } from "typed-redux-saga/macro";
import { mvlMockPdfAttachment } from "../../types/__mock__/mvlMock";
import { downloadMvlAttachment } from "../networking/downloadMvlAttachment";
import { mvlAttachmentDownload } from "../../store/actions/downloads";
import { SessionToken } from "../../../../types/SessionToken";

const savePath = "/tmp/attachment.pdf";

describe("downloadMvlAttachment", () => {
  describe("given an attachment", () => {
    const attachment = mvlMockPdfAttachment;

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
          downloadMvlAttachment,
          "token" as SessionToken,
          mvlAttachmentDownload.request(attachment)
        )
          .put(
            mvlAttachmentDownload.success({
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
          downloadMvlAttachment,
          "token" as SessionToken,
          mvlAttachmentDownload.request(attachment)
        )
          .put(
            mvlAttachmentDownload.failure({
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
          downloadMvlAttachment,
          "token" as SessionToken,
          mvlAttachmentDownload.request(attachment)
        );
        yield* cancel(task);
      }

      it("then it puts a failure action without error", () =>
        expectSaga(saga)
          .put(
            mvlAttachmentDownload.failure({
              attachment
            })
          )
          .run());
    });
  });
});
