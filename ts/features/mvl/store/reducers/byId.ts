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
import { MvlData, MvlId } from "../../types/MvlData";
import { mvlLoadDetails } from "../actions";

export type MvlByIdState = IndexedById<pot.Pot<MvlData, Error>>;

/**
 * Store the MVL data based on the MVLId used to issue the request
 * @param state
 * @param action
 */
export const mvlByIdReducer = (
  state: MvlByIdState = {},
  action: Action
): MvlByIdState => {
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
    (_: GlobalState, id: MvlId) => id
  ],
  (byId, id): pot.Pot<MvlData, Error> => byId[id] ?? pot.none
);
