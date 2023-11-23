import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * Actions which sets the wallet lifecycle status to operational.
 * It is intercepted by itw reducers to reset their state.
 */
export const itwLifecycleOperational = createStandardAction(
  "ITW_LIFECYCLE_OPERATIONAL"
)<void>();

/**
 * Actions which sets the wallet lifecycle status to valid.
 */
export const itwLifecycleValid = createStandardAction(
  "ITW_LIFECYCLE_VALID"
)<void>();

/**
 * Actions which sets the wallet lifecycle status to deactivated.
 */
export const itwLifecycleDeactivated = createStandardAction(
  "ITW_LIFECYCLE_DEACTIVATED"
)<void>();

/**
 * Type for the wallet lifecycle related actions.
 */
export type ItwLifecycleActions =
  | ActionType<typeof itwLifecycleOperational>
  | ActionType<typeof itwLifecycleValid>
  | ActionType<typeof itwLifecycleDeactivated>;
