import { ActionType, createStandardAction } from "typesafe-actions";
import { ItwCieAuthenticationActions } from "./cie";

/**
 * Start ITW activation
 */
export const itwActivationStart = createStandardAction(
  "ITW_ACTIVATION_START"
)<void>();

export type ItwActions =
  | ActionType<typeof itwActivationStart>
  | ItwCieAuthenticationActions;
