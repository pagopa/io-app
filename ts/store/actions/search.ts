/**
 * Action types and action creator related to the Search.
 */

import * as O from "fp-ts/lib/Option";
import { ActionType, createStandardAction } from "typesafe-actions";

export const searchMessagesEnabled = createStandardAction(
  "SEARCH_MESSAGES_ENABLED"
)<boolean>();

export const updateSearchText =
  createStandardAction("UPDATE_SEARCH_TEXT")<O.Option<string>>();

export const disableSearch = createStandardAction("DISABLE_SEARCH")();

export type SearchActions =
  | ActionType<typeof searchMessagesEnabled>
  | ActionType<typeof updateSearchText>
  | ActionType<typeof disableSearch>;
