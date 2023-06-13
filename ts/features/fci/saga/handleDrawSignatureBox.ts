import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import * as O from "fp-ts/lib/Option";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { ActionType } from "typesafe-actions";
import { parsePdfAsBase64, drawSignatureField } from "../utils/signatureFields";
import {
  fciSignatureFieldDrawingRawDocumentSelector,
  fciSignatureFieldDrawingRawUriSelector
} from "../store/reducers/fciDocumentSignatureFields";
import { fciDocumentSignatureFields } from "../store/actions";
import { getError } from "../../../utils/errors";

/**
 * Handle the FCI signature box drawing.
 */
export function* handleDrawSignatureBox(
  action: ActionType<typeof fciDocumentSignatureFields.request>
): SagaIterator {
  try {
    const cachedUri = yield* select(fciSignatureFieldDrawingRawUriSelector);
    if (cachedUri === action.payload.uri) {
      const cachedDoc = yield* select(
        fciSignatureFieldDrawingRawDocumentSelector
      );
      const res = yield* call(
        drawSignatureField,
        cachedDoc,
        action.payload.attrs
      );
      yield* put(
        fciDocumentSignatureFields.success({
          rawDocument: {
            document: O.some(cachedDoc),
            uri: O.some(action.payload.uri)
          },
          drawnDocument: pot.some(res)
        })
      );
    } else {
      const parsedDoc = yield* call(parsePdfAsBase64, action.payload.uri);
      const res = yield* call(
        drawSignatureField,
        parsedDoc,
        action.payload.attrs
      );
      yield* put(
        fciDocumentSignatureFields.success({
          rawDocument: {
            document: O.some(parsedDoc),
            uri: O.some(action.payload.uri)
          },
          drawnDocument: pot.some(res)
        })
      );
    }
  } catch (error) {
    yield* put(fciDocumentSignatureFields.failure(getError(error)));
  }
}
