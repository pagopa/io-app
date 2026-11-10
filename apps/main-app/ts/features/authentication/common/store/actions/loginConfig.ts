import { ActionType, createStandardAction } from "typesafe-actions";

import { OneIdentityEnv } from "../reducers/loginConfig";

/**
 * Sets the OneIdentity local feature flag. `undefined` clears the override (the
 * remote rollout percentage decides), while `true`/`false` always win over the
 * remote rollout percentage.
 */
export const setOneIdentityLocalFeatureFlag = createStandardAction(
  "SET_ONE_IDENTITY_LOCAL_FEATURE_FLAG"
)<boolean | undefined>();

export const setOneIdentityEnv = createStandardAction(
  "SET_ONE_IDENTITY_ENV"
)<OneIdentityEnv>();

export type LoginConfigActions =
  | ActionType<typeof setOneIdentityEnv>
  | ActionType<typeof setOneIdentityLocalFeatureFlag>;
