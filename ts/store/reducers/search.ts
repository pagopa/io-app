/**
 * A reducer for the Search
 */
import { getType } from "typesafe-actions";

import { none, Option } from "fp-ts/lib/Option";
import {
  clearSearchText,
  searchEnabled,
  updateSearchText
} from "../actions/search";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type SearchState = Readonly<{
  searchText: Option<string>;
  isSearchEnabled: boolean;
}>;

const INITIAL_STATE: SearchState = {
  searchText: none,
  isSearchEnabled: false
};

// Selectors
export const searchTextSelector = (state: GlobalState): Option<string> =>
  state.search.searchText;

export const isSearchEnabledSelector = (state: GlobalState): boolean =>
  state.search.isSearchEnabled;

const reducer = (
  state: SearchState = INITIAL_STATE,
  action: Action
): SearchState => {
  switch (action.type) {
    case getType(searchEnabled):
      return { ...state, isSearchEnabled: action.payload };

    case getType(updateSearchText):
      return { ...state, searchText: action.payload };

    case getType(clearSearchText):
      return INITIAL_STATE;

    default:
      return state;
  }
};

export default reducer;
