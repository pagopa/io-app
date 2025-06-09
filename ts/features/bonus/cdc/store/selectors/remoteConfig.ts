import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../store/reducers/types";

const cdcRemoteConfigSelector = (state: GlobalState) =>
  pipe(
    state.remoteConfig,
    O.map(config => config.cdcV2)
  );

/**
 * Return the remote config about CDC CTA inside the onboarding screen.
 */
export const cdcCtaConfigSelector = createSelector(
  cdcRemoteConfigSelector,
  cdcConfig =>
    pipe(
      cdcConfig,
      O.map(cdc => cdc.cta_onboarding_config),
      O.toUndefined
    )
);
