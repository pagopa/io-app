import { getType } from "typesafe-actions";
import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { Action } from "../../../../store/actions/types";
import { fciClearStateRequest, fciPollFilledDocument } from "../actions";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";

export type FciPollFilledDocumentState = pot.Pot<
  { isReady: boolean },
  NetworkError
>;

const initialState: FciPollFilledDocumentState = pot.some({
  isReady: false
});

const reducer = (
  state: FciPollFilledDocumentState = initialState,
  action: Action
): FciPollFilledDocumentState => {
  switch (action.type) {
    case getType(fciPollFilledDocument.request):
      return pot.toLoading(state);
    case getType(fciPollFilledDocument.success):
      return pot.some(action.payload);
    case getType(fciPollFilledDocument.failure):
      return pot.toError(state, action.payload);
    case getType(fciClearStateRequest):
      return initialState;
  }

  return state;
};

// Selectors
export const fciPollFilledDocumentSelector = (
  state: GlobalState
): FciPollFilledDocumentState => state.features.fci.pollFilledDocument;

export const fciPollFilledDocumentReadySelector = createSelector(
  fciPollFilledDocumentSelector,
  pollFilledDocument =>
    pot.isSome(pollFilledDocument) ? pollFilledDocument.value.isReady : false
);

export const fciPollFilledDocumentErrorSelector = createSelector(
  fciPollFilledDocumentSelector,
  pollFilledDocument =>
    pot.isError(pollFilledDocument) ? pollFilledDocument.error : undefined
);

export default reducer;
