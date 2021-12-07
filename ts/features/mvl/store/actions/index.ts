import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../utils/errors";
import { Mvl, MvlId, WithMVLId } from "../../types/mvlData";

/**
 * The user requests the MVL details, starting from the MVLId
 */
export const mvlDetailsLoad = createAsyncAction(
  "MVL_DETAILS_REQUEST",
  "MVL_DETAILS_SUCCESS",
  "MVL_DETAILS_FAILURE"
)<MvlId, Mvl, WithMVLId<NetworkError>>();

export type MvlActions = ActionType<typeof mvlDetailsLoad>;
