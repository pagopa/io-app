import { ActionType, createAsyncAction } from "typesafe-actions";
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

export type MvlActions = ActionType<typeof mvlDetailsLoad>;
