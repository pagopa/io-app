import { GlobalState } from "../../../../../store/reducers/types";

/**
 * Whether the current session was opened through the OneIdentity login flow.
 *
 * - `undefined`: the user is not logged in
 * - `false`: logged in with IO
 * - `true`: logged in with OneIdentity
 */
export const isOneIdentityLoginSelector = (
  state: GlobalState
): boolean | undefined =>
  state.features.loginFeatures.loginFlow.isOneIdentityLogin;
