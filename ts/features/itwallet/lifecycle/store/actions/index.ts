import { ActionType, createStandardAction } from "typesafe-actions";

export const itwLifecycleInstalled = createStandardAction(
  "ITW_LIFECYCLE_INSTALLED"
)<void>();

export const itwLifecycleOperational = createStandardAction(
  "ITW_LIFECYCLE_OPERATIONAL"
)<void>();

export const itwLifecycleValid = createStandardAction(
  "ITW_LIFECYCLE_VALID"
)<void>();

export const itwLifecycleDeactivated = createStandardAction(
  "ITW_LIFECYCLE_DEACTIVATED"
)<void>();

/**
 * Type for the wallet lifecycle related actions.
 */
export type ItwLifecycleActions =
  | ActionType<typeof itwLifecycleOperational>
  | ActionType<typeof itwLifecycleValid>
  | ActionType<typeof itwLifecycleDeactivated>
  | ActionType<typeof itwLifecycleInstalled>;
