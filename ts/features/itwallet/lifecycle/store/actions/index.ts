import { ActionType, createStandardAction } from "typesafe-actions";
import { ItwLifecycleState } from "../reducers";

/**
 * Action used to update the state of the wallet instance.
 */
export const itwLifecycleStateUpdated = createStandardAction(
  "ITW_LIFECYCLE_STATE_UPDATED"
)<ItwLifecycleState>();

/**
 * Action used to trigger a reset of the wallet instance.
 * Different reducers handle it to reset their slice.
 */
export const itwLifecycleWalletReset = createStandardAction(
  "ITW_LIFECYCLE_WALLET_RESET"
)<void>();

/**
 * Type for the wallet lifecycle related actions.
 */
export type ItwLifecycleActions =
  | ActionType<typeof itwLifecycleStateUpdated>
  | ActionType<typeof itwLifecycleWalletReset>;
