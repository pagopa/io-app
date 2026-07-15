import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";

import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import { NetworkError } from "../../../../utils/errors";
import { fciClearStateRequest, fciPollFilledDocument } from "../actions";

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
    case getType(fciClearStateRequest):
      return initialState;
    case getType(fciPollFilledDocument.failure):
      return pot.toError(state, action.payload);
    case getType(fciPollFilledDocument.success):
      return pot.some(action.payload);
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
