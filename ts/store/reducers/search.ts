/**
 * A reducer for the Search
 */
import { getType } from "typesafe-actions";

import { none, Option } from "fp-ts/lib/Option";
import {
  disableSearch,
  searchMessagesEnabled,
  searchServicesEnabled,
  updateSearchText
} from "../actions/search";
import { Action } from "../actions/types";
import { GlobalState } from "./types";

export type SearchState = Readonly<{
  searchText: Option<string>;
  isSearchEnabled: boolean;
  isSearchMessagesEnabled: boolean;
  isSearchServicesEnabled: boolean;
}>;

const INITIAL_STATE: SearchState = {
  searchText: none,
  isSearchEnabled: false,
  isSearchMessagesEnabled: false,
  isSearchServicesEnabled: false
};

// Selectors
export const searchTextSelector = (state: GlobalState): Option<string> =>
  state.search.searchText;

export const isSearchEnabledSelector = (state: GlobalState): boolean =>
  state.search.isSearchEnabled;

export const isSearchMessagesEnabledSelector = (state: GlobalState): boolean =>
  state.search.isSearchMessagesEnabled;

export const isSearchServicesEnabledSelector = (state: GlobalState): boolean =>
  state.search.isSearchServicesEnabled;

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

    case getType(searchServicesEnabled):
      return {
        ...state,
        isSearchEnabled: action.payload,
        isSearchServicesEnabled: action.payload
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
