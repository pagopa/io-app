import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../utils/errors";
import { MVLData, MVLId, WithMVLId } from "../../types/MVLData";

/**
 * The user requests the MVL details, starting from the MVLId
 */
export const mvlLoadDetails = createAsyncAction(
  "MVL_DETAILS_REQUEST",
  "MVL_DETAILS_SUCCESS",
  "MVL_DETAILS_FAILURE"
)<MVLId, MVLData, WithMVLId<NetworkError>>();

export type MVLActions = ActionType<typeof mvlLoadDetails>;
