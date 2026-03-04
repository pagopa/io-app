import { type ItwVersion } from "@pagopa/io-react-native-wallet";
import { ActionType, createStandardAction } from "typesafe-actions";
import { EnvType } from "../../utils/environment.ts";

export const itwSetEnv = createStandardAction("ITW_SET_ENV")<EnvType>();
export const itwResetEnv = createStandardAction("ITW_RESET_ENV")();
export const itwChangeSpecsVersion = createStandardAction(
  "ITW_CHANGE_SPECS_VERSION"
)<ItwVersion>();

export type ItwEnvironmentActions =
  | ActionType<typeof itwSetEnv>
  | ActionType<typeof itwResetEnv>
  | ActionType<typeof itwChangeSpecsVersion>;
