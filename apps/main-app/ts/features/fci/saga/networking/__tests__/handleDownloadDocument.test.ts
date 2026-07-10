import ReactNativeBlobUtil from "react-native-blob-util";
import { expectSaga } from "redux-saga-test-plan";
import { cancel, fork } from "typed-redux-saga/macro";
import { handleDownloadDocument } from "../handleDownloadDocument";
import { fciDownloadPreview } from "../../../store/actions";
import { getNetworkError } from "../../../../../utils/errors";

const savePath = "/tmp/example.pdf";

const ReactNativeBlobUtilMock = (status: number, body = "") =>
  // `config` is not a pre-existing property on the mocked module, so
  // jest.spyOn() cannot be used here, assign the mock directly instead.
  // eslint-disable-next-line functional/immutable-data, jest/prefer-spy-on
  ((ReactNativeBlobUtil as any).config = jest.fn(() => ({
    fetch: jest.fn().mockReturnValue({
      info: jest.fn().mockReturnValue({ status }),
      path: jest.fn().mockReturnValue(savePath),
      text: jest.fn().mockResolvedValue(body)
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

    describe("when a download request fails with a generic error", () => {
      const status = 404;

      beforeAll(() => {
        ReactNativeBlobUtilMock(status, "Not Found");
      });

      it("then it puts a generic failure action", () =>
        expectSaga(handleDownloadDocument, fciDownloadPreview.request({ url }))
          .put(
            fciDownloadPreview.failure(
              getNetworkError(new Error(`error ${status} fetching ${url}`))
            )
          )
          .run());
    });

    describe("when a download request fails with no body", () => {
      const status = 500;

      beforeAll(() => {
        ReactNativeBlobUtilMock(status, "");
      });

      it("then it puts a generic failure action", () =>
        expectSaga(handleDownloadDocument, fciDownloadPreview.request({ url }))
          .put(
            fciDownloadPreview.failure(
              getNetworkError(new Error(`error ${status} fetching ${url}`))
            )
          )
          .run());
    });

    describe("when a download request fails with an expired document error", () => {
      beforeAll(() => {
        ReactNativeBlobUtilMock(
          403,
          `<?xml version="1.0" encoding="utf-8"?>
          <Error>
            <Code>AuthenticationFailed</Code>
            <Message>Server failed to authenticate the request. Make sure the value of Authorization header is formed correctly including the signature.
          RequestId:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
          Time:...</Message>
            <AuthenticationErrorDetail>Signature not valid in the specified time frame: ...</AuthenticationErrorDetail>
          </Error>`
        );
      });

      it("then it puts an expired failure action", () =>
        expectSaga(handleDownloadDocument, fciDownloadPreview.request({ url }))
          .put(fciDownloadPreview.failure({ kind: "expired" }))
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
