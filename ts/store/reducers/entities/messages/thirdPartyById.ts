import * as pot from "@pagopa/ts-commons/lib/pot";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { loadThirdPartyMessage } from "../../../../features/messages/store/actions";
import { Action } from "../../../../store/actions/types";
import { IndexedById } from "../../../../store/helpers/indexer";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";
import {
  toError,
  toLoading,
  toSome
} from "../../../../store/reducers/IndexedByIdPot";
import { GlobalState } from "../../../../store/reducers/types";

export type ThirdPartyById = IndexedById<
  pot.Pot<ThirdPartyMessageWithContent, Error>
>;

export const initialState: ThirdPartyById = {};

/**
 * Store third party message content
 * @param state
 * @param action
 */
export const thirdPartyByIdReducer = (
  state: ThirdPartyById = initialState,
  action: Action
): ThirdPartyById => {
  switch (action.type) {
    case getType(loadThirdPartyMessage.request):
      return toLoading(action.payload, state);
    case getType(loadThirdPartyMessage.success):
      return toSome(action.payload.id, state, action.payload.content);
    case getType(loadThirdPartyMessage.failure):
      return toError(action.payload.id, state, action.payload.error);
  }
  return state;
};

/**
 * From UIMessageId to the third party content pot
 */
export const thirdPartyFromIdSelector = createSelector(
  [
    (state: GlobalState) => state.entities.messages.thirdPartyById,
    (_: GlobalState, id: UIMessageId) => id
  ],
  (byId, id): pot.Pot<ThirdPartyMessageWithContent, Error> =>
    byId[id] ?? pot.none
);
