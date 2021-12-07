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
import { Mvl, MvlId } from "../../types/mvlData";
import { mvlDetailsLoad } from "../actions";

export type MvlByIdState = IndexedById<pot.Pot<Mvl, Error>>;

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
    case getType(mvlDetailsLoad.request):
      return toLoading(action.payload, state);
    case getType(mvlDetailsLoad.success):
      return toSome(action.payload.id, state, action.payload);
    case getType(mvlDetailsLoad.failure):
      return toError(
        action.payload.id,
        state,
        new Error(getNetworkErrorMessage(action.payload))
      );
  }

  return state;
};

/**
 * From MVLId to Mvl
 */
export const mvlFromIdSelector = createSelector(
  [
    (state: GlobalState) => state.features.mvl.byId,
    (_: GlobalState, id: MvlId) => id
  ],
  (byId, id): pot.Pot<Mvl, Error> => byId[id] ?? pot.none
);
