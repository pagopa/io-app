import * as pot from "italia-ts-commons/lib/pot";
import { createSelector } from "reselect";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import { GlobalState } from "../../../../store/reducers/types";

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
): PnContentByIdState => state;

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
