import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import {
  fciAbortingRequest,
  fciLoadQtspFilledDocument
} from "../actions/fciSignatureRequest";
import { Action } from "../../../../store/actions/types";
import { NetworkError } from "../../../../utils/errors";
import { FilledDocumentDetailView } from "../../../../../definitions/fci/FilledDocumentDetailView";

export type FciQtspFilledDocumentRequestState = pot.Pot<
  FilledDocumentDetailView,
  NetworkError
>;

const emptyState: FciQtspFilledDocumentRequestState = pot.none;

const reducer = (
  state: FciQtspFilledDocumentRequestState = emptyState,
  action: Action
): FciQtspFilledDocumentRequestState => {
  switch (action.type) {
    case getType(fciLoadQtspFilledDocument.request):
      return pot.toLoading(state);
    case getType(fciLoadQtspFilledDocument.success):
      return pot.some(action.payload);
    case getType(fciLoadQtspFilledDocument.failure):
      return pot.toError(state, action.payload);
    case getType(fciAbortingRequest):
      return emptyState;
  }

  return state;
};

export default reducer;
