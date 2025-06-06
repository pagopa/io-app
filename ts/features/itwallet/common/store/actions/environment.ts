import { ActionType, createStandardAction } from "typesafe-actions";
import { EnvType } from "../../utils/environment.ts";

export const itwSetEnv = createStandardAction("ITW_SET_ENV")<EnvType>();
export const itwResetEnv = createStandardAction("ITW_RESET_ENV")();

export type ItwEnvironmentActions =
  | ActionType<typeof itwSetEnv>
  | ActionType<typeof itwResetEnv>;
