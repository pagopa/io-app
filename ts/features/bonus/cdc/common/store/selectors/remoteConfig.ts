import { pipe } from "fp-ts/lib/function";
import { createSelector } from "reselect";
import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../../store/reducers/types";
import { remoteConfigSelector } from "../../../../../../store/reducers/backendStatus/remoteConfig";
import { isPropertyWithMinAppVersionEnabled } from "../../../../../../store/reducers/featureFlagWithMinAppVersionStatus";

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

/**
 * Return true if the CdC wallet visibility feature is enabled by remote config and the app version is supported
 * TODO: Use this selector when implementing the CdC wallet feature (https://pagopa.atlassian.net/browse/IOBP-1776)
 */
export const isCdCWalletVisibilityEnabledSelector = (state: GlobalState) =>
  pipe(state, remoteConfigSelector, remoteConfig =>
    isPropertyWithMinAppVersionEnabled({
      remoteConfig,
      mainLocalFlag: true,
      configPropertyName: "cdcV2",
      optionalLocalFlag: true,
      optionalConfig: "walletVisibility"
    })
  );

/**
 * Return the remote config about CDC wallet visibility.
 */
export const cdcWalletVisibilityConfigSelector = createSelector(
  cdcRemoteConfigSelector,
  cdcConfig =>
    pipe(
      cdcConfig,
      O.map(cdc => cdc.walletVisibility?.configurations),
      O.toUndefined
    )
);
