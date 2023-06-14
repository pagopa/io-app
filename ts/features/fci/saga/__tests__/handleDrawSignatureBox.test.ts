import { expectSaga } from "redux-saga-test-plan";
import * as pot from "@pagopa/ts-commons/lib/pot";
import * as matchers from "redux-saga-test-plan/matchers";
import * as O from "fp-ts/lib/Option";
import { throwError } from "redux-saga-test-plan/providers";
import { handleDrawSignatureBox } from "../handleDrawSignatureBox";
import { fciDocumentSignatureFields } from "../../store/actions";
import { SignatureFieldAttrType } from "../../components/DocumentWithSignature";
import {
  drawSignatureField,
  parsePdfAsBase64
} from "../../utils/signatureFields";
import {
  fciSignatureFieldDrawingRawDocumentSelector,
  fciSignatureFieldDrawingRawUriSelector
} from "../../store/reducers/fciSignatureFieldDrawing";

jest.mock("react-native-blob-util", () => ({
  fs: {
    readFile: jest
      .fn()
      .mockImplementation(() => Promise.resolve("base64-encoded-pdf-bytes"))
  }
}));

describe("handleDrawSignatureBox", () => {
  const uri = "cachedUri";
  const document = "cachedDocument";
  const newUri = "newUri";
  const page = 0;
  const attrs = {
    unique_name: "test"
  } as SignatureFieldAttrType;

  it("should draw signature field on cached document if URI matches", async () => {
    await expectSaga(
      handleDrawSignatureBox,
      fciDocumentSignatureFields.request({ uri, attrs })
    )
      .provide([
        [matchers.select(fciSignatureFieldDrawingRawUriSelector), uri],
        [
          matchers.select(fciSignatureFieldDrawingRawDocumentSelector),
          document
        ],
        [matchers.call.fn(parsePdfAsBase64), document],
        [matchers.call.fn(drawSignatureField), { document, page }]
      ])
      .put(
        fciDocumentSignatureFields.success({
          drawnDocument: pot.some({ document, page })
        })
      )
      .run();
  });

  it("should draw parse the document before drawing the signature field if URI doesn't match", async () => {
    await expectSaga(
      handleDrawSignatureBox,
      fciDocumentSignatureFields.request({ uri: newUri, attrs })
    )
      .provide([
        [matchers.select(fciSignatureFieldDrawingRawUriSelector), uri],
        [matchers.call.fn(parsePdfAsBase64), document],
        [matchers.call.fn(drawSignatureField), { document, page }]
      ])
      .put(
        fciDocumentSignatureFields.success({
          rawDocument: {
            document: O.some(document),
            uri: O.some(newUri)
          },
          drawnDocument: pot.some({
            document,
            page
          })
        })
      )
      .run();
  });

  it("should dispatch a failure event if an exception occurs", async () => {
    const error = new Error("error");
    await expectSaga(
      handleDrawSignatureBox,
      fciDocumentSignatureFields.request({ uri: newUri, attrs })
    )
      .provide([
        [matchers.select(fciSignatureFieldDrawingRawUriSelector), uri],
        [matchers.call.fn(parsePdfAsBase64), throwError(error)]
      ])
      .put(fciDocumentSignatureFields.failure(error))
      .run();
  });
});
