import { ActionType, createStandardAction } from "typesafe-actions";
import { ItwLifecycleState } from "../reducers";

export const itwLifecycleStateUpdated = createStandardAction(
  "ITW_LIFECYCLE_STATE_UPDATED"
)<ItwLifecycleState>();

/**
 * Type for the wallet lifecycle related actions.
 */
export type ItwLifecycleActions = ActionType<typeof itwLifecycleStateUpdated>;
