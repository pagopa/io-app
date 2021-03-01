import { ActionType, createAsyncAction } from "typesafe-actions";
import { NetworkError } from "../../../../../../utils/errors";
import { EycaCard } from "../../../../../../../definitions/cgn/EycaCard";

type EycaCardStatus = {
  status: "INELIGIBLE" | "ELIGIBLE";
  information?: EycaCard;
};

/**
 * get and handle activation state of the EYCA Card
 */
export const cgnEycaDetails = createAsyncAction(
  "CGN_EYCA_DETAILS_REQUEST",
  "CGN_EYCA_DETAILS_SUCCESS",
  "CGN_EYCA_DETAILS_FAILURE"
)<void, EycaCardStatus, NetworkError>();

export type CgnEycaDetailsActions = ActionType<typeof cgnEycaDetails>;
