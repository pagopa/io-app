/**
 * Action types and action creator related to OutcomeCodeState.
 */
import { Option } from "fp-ts/lib/Option";
import { ActionType, createStandardAction } from "typesafe-actions";

export const outcomeCodeRetrieved = createStandardAction(
  "OUTCOME_CODE_RETRIEVED"
)<Option<string>>();

export type OutcomeCodeActions = ActionType<typeof outcomeCodeRetrieved>;
