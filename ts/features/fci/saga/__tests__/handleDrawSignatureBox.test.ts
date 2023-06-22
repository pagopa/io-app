import { expectSaga } from "redux-saga-test-plan";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import { handleDrawSignatureBox } from "../handleDrawSignatureBox";
import { fciDocumentSignatureFields } from "../../store/actions";
import { SignatureFieldAttrType } from "../../components/DocumentWithSignature";
import {
  drawSignatureField,
  parsePdfAsBase64
} from "../../utils/signatureFields";
import { fciSignatureFieldDrawingSelector } from "../../store/reducers/fciSignatureFieldDrawing";

jest.mock("react-native-blob-util", () => ({
  fs: {
    readFile: jest
      .fn()
      .mockImplementation(() => Promise.resolve("base64-encoded-pdf-bytes"))
  }
}));

describe("handleDrawSignatureBox", () => {
  const cachedState = {
    rawBase64: "cachedRaw",
    uri: "cachedUri",
    drawnBase64: "cachedDrawn",
    signaturePage: 0
  };
  const newState = {
    rawBase64: "newRaw",
    uri: "newUri",
    drawnBase64: "newDrawn",
    signaturePage: 1
  };
  const attrs = {
    unique_name: "test"
  } as SignatureFieldAttrType;

  it("should draw signature field on cached document if URI matches", async () => {
    await expectSaga(
      handleDrawSignatureBox,
      fciDocumentSignatureFields.request({ uri: cachedState.uri, attrs })
    )
      .provide([
        [
          matchers.select(fciSignatureFieldDrawingSelector),
          pot.some(cachedState)
        ],
        [
          matchers.call.fn(drawSignatureField),
          {
            drawnBase64: newState.drawnBase64,
            signaturePage: newState.signaturePage
          }
        ]
      ])
      .put(
        fciDocumentSignatureFields.success({
          ...cachedState,
          drawnBase64: newState.drawnBase64,
          signaturePage: newState.signaturePage
        })
      )
      .run();
  });

  it("should draw parse the document before drawing the signature field if URI doesn't match", async () => {
    await expectSaga(
      handleDrawSignatureBox,
      fciDocumentSignatureFields.request({ uri: newState.uri, attrs })
    )
      .provide([
        [
          matchers.select(fciSignatureFieldDrawingSelector),
          pot.some(cachedState)
        ],
        [matchers.call.fn(parsePdfAsBase64), newState.rawBase64],
        [
          matchers.call.fn(drawSignatureField),
          {
            drawnBase64: newState.drawnBase64,
            signaturePage: newState.signaturePage
          }
        ]
      ])
      .put(fciDocumentSignatureFields.success(newState))
      .run();
  });

  it("should dispatch a failure event if an exception occurs", async () => {
    const error = new Error("error");
    await expectSaga(
      handleDrawSignatureBox,
      fciDocumentSignatureFields.request({ uri: newState.uri, attrs })
    )
      .provide([
        [
          matchers.select(fciSignatureFieldDrawingSelector),
          pot.some(cachedState)
        ],
        [matchers.call.fn(parsePdfAsBase64), throwError(error)]
      ])
      .put(fciDocumentSignatureFields.failure(error))
      .run();
  });
});
