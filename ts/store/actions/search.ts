/**
 * Action types and action creator related to the Search.
 */

import { Option } from "fp-ts/lib/Option";
import { ActionType, createStandardAction } from "typesafe-actions";

export const searchEnabled = createStandardAction("SEARCH_ENABLED")<boolean>();

export const updateSearchText = createStandardAction("UPDATE_SEARCH_TEXT")<
  Option<string>
>();

export const clearSearchText = createStandardAction("CLEAR_SEARCH_TEXT")();

export type SearchActions =
  | ActionType<typeof searchEnabled>
  | ActionType<typeof updateSearchText>
  | ActionType<typeof clearSearchText>;
