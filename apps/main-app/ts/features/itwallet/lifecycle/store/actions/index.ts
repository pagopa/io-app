import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * @internal To fully reset the Wallet Instance, dispatch `itwLifecycleWalletReset`.
 *
 * Action used to only reset IT Wallet's Redux store slices.
 */
export const itwLifecycleStoresReset = createStandardAction(
  "ITW_LIFECYCLE_STORES_RESET"
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
 * Action used to resume the startup saga after the authenticated user's identity check.
 */
export const itwLifecycleIdentityCheckCompleted = createStandardAction(
  "ITW_LIFECYCLE_IDENTITY_CHECK_COMPLETED"
)<void>();

/**
 * Type for the wallet lifecycle related actions.
 */
export type ItwLifecycleActions =
  | ActionType<typeof itwLifecycleStoresReset>
  | ActionType<typeof itwLifecycleWalletReset>
  | ActionType<typeof itwLifecycleIdentityCheckCompleted>;
