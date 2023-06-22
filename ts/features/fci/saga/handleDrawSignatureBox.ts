import { SagaIterator } from "redux-saga";
import { call, put, select } from "typed-redux-saga/macro";
import { ActionType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { parsePdfAsBase64, drawSignatureField } from "../utils/signatureFields";
import { fciSignatureFieldDrawingSelector } from "../store/reducers/fciSignatureFieldDrawing";
import { fciDocumentSignatureFields } from "../store/actions";
import { getError } from "../../../utils/errors";

/**
 * Handle the FCI signature box drawing.
 * The saga checks for a cached document and if it is present it uses it to draw the signature box
 * Otherwise it parses the document and then draws the signature box
 * @param action the action to handle
 * @returns a SagaIterator
 */
export function* handleDrawSignatureBox(
  action: ActionType<typeof fciDocumentSignatureFields.request>
): SagaIterator {
  try {
    const state = yield* select(fciSignatureFieldDrawingSelector);
    if (pot.isSome(state) && state.value.uri === action.payload.uri) {
      const res = yield* call(
        drawSignatureField,
        state.value.rawBase64,
        action.payload.attrs
      );
      yield* put(
        fciDocumentSignatureFields.success({
          ...state.value,
          drawnBase64: res.drawn,
          signaturePage: res.signaturePage
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
          rawBase64: parsedDoc,
          uri: action.payload.uri,
          drawnBase64: res.drawn,
          signaturePage: res.signaturePage
        })
      );
    }
  } catch (error) {
    yield* put(fciDocumentSignatureFields.failure(getError(error)));
  }
}
