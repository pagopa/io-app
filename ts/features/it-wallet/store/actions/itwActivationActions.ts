import { ActionType, createStandardAction } from "typesafe-actions";

/**
 * Start ITW activation
 */
export const itwActivationStart = createStandardAction(
  "ITW_ACTIVATION_START"
)<void>();

/**
 * Stop ITW activation
 */
export const itwActivationStop = createStandardAction(
  "ITW_ACTIVATION_STOP"
)<void>();

/**
 * Complete ITW activation
 */
export const itwActivationCompleted = createStandardAction(
  "ITW_ACTIVATION_COMPLETED"
)<void>();

/**
 * Type for activation related actions.
 */
export type ItwActivationActions =
  | ActionType<typeof itwActivationStart>
  | ActionType<typeof itwActivationStop>
  | ActionType<typeof itwActivationCompleted>;
