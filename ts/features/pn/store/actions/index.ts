import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import { ThirdPartyMessageWithContent } from "../../../../../definitions/backend/ThirdPartyMessageWithContent";
import { UIMessageId } from "../../../../store/reducers/entities/messages/types";

/**
 * Set whether to show a warning message when opening a PN message.
 * The preference will be persisted.
 */
export const pnPreferencesSetWarningForMessageOpening = createStandardAction(
  "PN_PREFERENCES_SET_WARNING_FOR_MESSAGE_OPENING"
)<boolean>();

/**
 * The user requests the message content from PN.
 */
export const loadPnContent = createAsyncAction(
  "PN_CONTENT_LOAD_REQUEST",
  "PN_CONTENT_LOAD_SUCCESS",
  "PN_CONTENT_LOAD_FAILURE"
)<
  UIMessageId,
  { id: UIMessageId; content: ThirdPartyMessageWithContent },
  { id: UIMessageId; error: Error }
>();

export type PnActions = ActionType<
  typeof pnPreferencesSetWarningForMessageOpening | typeof loadPnContent
>;
