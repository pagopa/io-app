import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { DocumentDetailView } from "../../../../../definitions/fci/DocumentDetailView";
import { SignatureRequestDetailView } from "../../../../../definitions/fci/SignatureRequestDetailView";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { fciSignatureRequestFromId, fciClearStateRequest } from "../actions";

export type FciSignatureRequestState = pot.Pot<
  SignatureRequestDetailView,
  NetworkError
>;

const emptyState: FciSignatureRequestState = pot.none;

const reducer = (
  state: FciSignatureRequestState = emptyState,
  action: Action
): FciSignatureRequestState => {
  switch (action.type) {
    case getType(fciSignatureRequestFromId.request):
      return pot.toLoading(state);
    case getType(fciSignatureRequestFromId.success):
      return pot.some(action.payload);
    case getType(fciSignatureRequestFromId.failure):
      return pot.toError(state, action.payload);
    case getType(fciClearStateRequest):
      return emptyState;
  }

  return state;
};

// Selectors
export const fciSignatureRequestSelector = (
  state: GlobalState
): FciSignatureRequestState => state.features.fci.signatureRequest;

export const fciSignatureDetailDocumentsSelector = createSelector(
  fciSignatureRequestSelector,
  signatureDetailView =>
    pot.isSome(signatureDetailView) ? signatureDetailView.value.documents : []
);

export const fciDocumentSignatureFieldsFieldsSelector = (
  documentId: DocumentDetailView["id"]
) =>
  createSelector(fciSignatureRequestSelector, signatureDetailView =>
    pot.getOrElse(
      pot.map(
        signatureDetailView,
        signatureRequest =>
          signatureRequest.documents.find(d => d.id === documentId)?.metadata
            .signature_fields || []
      ),
      []
    )
  );

export default reducer;
