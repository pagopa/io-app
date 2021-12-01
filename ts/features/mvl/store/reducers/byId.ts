import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import {
  toError,
  toLoading,
  toSome
} from "../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../store/reducers/types";
import { getNetworkErrorMessage } from "../../../../utils/errors";
import { MVLData, MVLId } from "../../types/MVLData";
import { mvlLoadDetails } from "../actions";

export type MVLByIdState = IndexedById<pot.Pot<MVLData, Error>>;

/**
 * Store the MVL data based on the MVLId used to issue the request
 * @param state
 * @param action
 */
export const mvlByIdReducer = (
  state: MVLByIdState = {},
  action: Action
): MVLByIdState => {
  switch (action.type) {
    case getType(mvlLoadDetails.request):
      return toLoading(action.payload, state);
    case getType(mvlLoadDetails.success):
      return toSome(action.payload.id, state, action.payload);
    case getType(mvlLoadDetails.failure):
      return toError(
        action.payload.id,
        state,
        new Error(getNetworkErrorMessage(action.payload))
      );
  }

  return state;
};

/**
 * From MVLId to MvlData
 */
export const mvlFromIdSelector = createSelector(
  [
    (state: GlobalState) => state.features.mvl.byId,
    (_: GlobalState, id: MVLId) => id
  ],
  (byId, id): pot.Pot<MVLData, Error> => byId[id] ?? pot.none
);
