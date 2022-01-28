import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import {
  UIMessageId,
  WithUIMessageId
} from "../../../../store/reducers/entities/messages/types";
import { NetworkError } from "../../../../utils/errors";
import { Mvl } from "../../types/mvlData";

/**
 * The user requests the MVL details, starting from the MVLId
 */
export const mvlDetailsLoad = createAsyncAction(
  "MVL_DETAILS_REQUEST",
  "MVL_DETAILS_SUCCESS",
  "MVL_DETAILS_FAILURE"
)<UIMessageId, Mvl, WithUIMessageId<NetworkError>>();

/**
 * Set whether to show a warning message about security when opening attachments.
 * The preference will be persisted.
 */
export const mvlPreferencesSetWarningForAttachments = createStandardAction(
  "MVL_PREFERENCES_SET_WARNING_FOR_ATTACHMENTS"
)<boolean>();

export type MvlActions = ActionType<
  typeof mvlDetailsLoad | typeof mvlPreferencesSetWarningForAttachments
>;
