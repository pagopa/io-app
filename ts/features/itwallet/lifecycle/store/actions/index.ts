import { ActionType, createStandardAction } from "typesafe-actions";
import { ItwLifecycleState } from "../reducers";

/**
 * Action used to update the state of the wallet instance.
 */
export const itwLifecycleStateUpdated = createStandardAction(
  "ITW_LIFECYCLE_STATE_UPDATED"
)<ItwLifecycleState>();

/**
 * @internal To fully reset the Wallet Instance, dispatch `itwLifecycleWalletReset`.
 *
 * Action used to reset IT Wallet reducers only.
 */
export const itwLifecycleReducersReset = createStandardAction(
  "ITW_LIFECYCLE_REDUCERS_RESET"
)<void>();

/**
 * Action used to trigger a reset of the wallet instance.
 *
 * The reset operation is orchestrated by a separate saga.
 */
export const itwLifecycleWalletReset = createStandardAction(
  "ITW_LIFECYCLE_WALLET_RESET"
)<void>();

/**
 * Type for the wallet lifecycle related actions.
 */
export type ItwLifecycleActions =
  | ActionType<typeof itwLifecycleStateUpdated>
  | ActionType<typeof itwLifecycleReducersReset>
  | ActionType<typeof itwLifecycleWalletReset>;
