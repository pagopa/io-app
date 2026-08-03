import * as O from "fp-ts/lib/Option";

import { remoteConfigSelector } from "../../../../../store/reducers/backendStatus/remoteConfig";
import { GlobalState } from "../../../../../store/reducers/types";

export const oneIdentityRemoteConfigSelector = (state: GlobalState) => {
  const remoteConfig = remoteConfigSelector(state);
  return O.isSome(remoteConfig) ? remoteConfig.value.oneIdentity : undefined;
};
