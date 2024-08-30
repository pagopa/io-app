/**
 * A reducer for the Search
 */
import { getType } from "typesafe-actions";

import * as O from "fp-ts/lib/Option";
import {
  disableSearch,
  searchMessagesEnabled,
  updateSearchText
} from "../actions/search";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type SearchState = Readonly<{
  searchText: O.Option<string>;
  isSearchEnabled: boolean;
  isSearchMessagesEnabled: boolean;
}>;

const INITIAL_STATE: SearchState = {
  searchText: O.none,
  isSearchEnabled: false,
  isSearchMessagesEnabled: false
};

// Selectors
export const searchTextSelector = (state: GlobalState): O.Option<string> =>
  state.search.searchText;

export const isSearchEnabledSelector = (state: GlobalState): boolean =>
  state.search.isSearchEnabled;

export const isSearchMessagesEnabledSelector = (state: GlobalState): boolean =>
  state.search.isSearchMessagesEnabled;

const reducer = (
  state: SearchState = INITIAL_STATE,
  action: Action
): SearchState => {
  switch (action.type) {
    case getType(searchMessagesEnabled):
      return {
        ...state,
        isSearchEnabled: action.payload,
        isSearchMessagesEnabled: action.payload
      };

    case getType(updateSearchText):
      return { ...state, searchText: action.payload };

    case getType(disableSearch):
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default reducer;
