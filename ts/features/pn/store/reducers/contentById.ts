import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import {
  toError,
  toLoading,
  toSome
} from "../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../store/reducers/types";
import { loadPnContent } from "../actions";

export type PnContentByIdState = IndexedById<
  pot.Pot<ThirdPartyMessageWithContent, Error>
>;

export const initialState: PnContentByIdState = {};

/**
 * Store PN message content
 * @param state
 * @param action
 */
export const pnContentByIdReducer = (
  state: PnContentByIdState = initialState,
  action: Action
): PnContentByIdState => {
  switch (action.type) {
    case getType(loadPnContent.request):
      return toLoading(action.payload, state);
    case getType(loadPnContent.success):
      return toSome(action.payload.id, state, action.payload.content);
    case getType(loadPnContent.failure):
      return toError(action.payload.id, state, action.payload.error);
  }
  return state;
};

/**
 * From UIMessageId to the PN content pot
 */
export const pnContentFromIdSelector = createSelector(
  [
    (state: GlobalState) => state.features.pn.contentById,
    (_: GlobalState, id: UIMessageId) => id
  ],
  (byId, id): pot.Pot<ThirdPartyMessageWithContent, Error> =>
    byId[id] ?? pot.none
);
