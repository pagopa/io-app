import ReactNativeBlobUtil from "react-native-blob-util";
import { expectSaga } from "redux-saga-test-plan";
import { cancel, fork } from "typed-redux-saga/macro";
import { handleDownloadDocument } from "../handleDownloadDocument";
import { fciDownloadPreview } from "../../../store/actions";
import { getNetworkError } from "../../../../../utils/errors";

const savePath = "/tmp/example.pdf";

const ReactNativeBlobUtilMock = (status: number) =>
  // eslint-disable-next-line functional/immutable-data
  ((ReactNativeBlobUtil as any).config = jest.fn(() => ({
    fetch: jest.fn().mockReturnValue({
      info: jest.fn().mockReturnValue({ status }),
      path: jest.fn().mockReturnValue(savePath)
    })
  })));

describe("Test handleDownloadDocument", () => {
  describe("given an url", () => {
    const url = "http://fakeUrl/example.pdf";

    describe("when a download request succeeds", () => {
      beforeAll(() => {
        ReactNativeBlobUtilMock(200);
      });

      it("then it puts a success action with the path of the saved attachment", () =>
        expectSaga(handleDownloadDocument, fciDownloadPreview.request({ url }))
          .put(
            fciDownloadPreview.success({
              path: savePath
            })
          )
          .run());
    });

    describe("when a download request fails", () => {
      const status = 404;

      beforeAll(() => {
        ReactNativeBlobUtilMock(status);
      });

      it("then it puts a failure action with the error", () =>
        expectSaga(handleDownloadDocument, fciDownloadPreview.request({ url }))
          .put(
            fciDownloadPreview.failure(
              getNetworkError(new Error(`error ${status} fetching ${url}`))
            )
          )
          .run());
    });

    describe("when the saga gets cancelled", () => {
      beforeAll(() => {
        ReactNativeBlobUtilMock(200);
      });

      function* saga() {
        const task = yield* fork(
          handleDownloadDocument,
          fciDownloadPreview.request({ url })
        );
        yield* cancel(task);
      }

      it("then it puts a cancel action", () =>
        expectSaga(saga).put(fciDownloadPreview.cancel()).run());
    });
  });
});
