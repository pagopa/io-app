import * as O from "fp-ts/lib/Option";
import { Platform } from "react-native";
import { createSelector } from "reselect";

import { GlobalState } from "../../../../../store/reducers/types";
import {
  getAppVersion,
  isVersionSupported
} from "../../../../../utils/appVersion";

const emptyArray: ReadonlyArray<string> = []; // to avoid unnecessary rerenders

/**
 * The whole remote configuration still lives in the app store as an fp-ts Option:
 * unwrap it here, at the boundary, so the IT-Wallet selectors work on plain values.
 */
const itwRemoteConfigSelector = (state: GlobalState) =>
  O.toUndefined(state.remoteConfig)?.itw;

/**
 * Returns the remote config for docIO
 */
export const isItwEnabledSelector = createSelector(
  itwRemoteConfigSelector,
  (itwConfig): boolean =>
    itwConfig !== undefined &&
    isVersionSupported(
      Platform.OS === "ios"
        ? itwConfig.min_app_version.ios
        : itwConfig.min_app_version.android,
      getAppVersion()
    ) &&
    itwConfig.enabled
);

/**
 * Returns the authentication methods that are disabled.
 * If there is no data, an empty array is returned as the default value.
 */
export const itwDisabledIdentificationMethodsSelector = createSelector(
  itwRemoteConfigSelector,
  (itwConfig): ReadonlyArray<string> =>
    itwConfig?.disabled_identification_methods ?? emptyArray
);

/**
 * Return whether the IT Wallet feedback banner is remotely enabled.
 */
export const isItwFeedbackBannerEnabledSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig => itwConfig?.feedback_banner_visible ?? false
);

/**
 * Return whether the Wallet activation is disabled.
 * This is purely a "cosmetic" configuration to disable UI elements,
 * it does not disable the entire IT Wallet feature.
 */
export const itwIsActivationDisabledSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig => itwConfig?.wallet_activation_disabled ?? false
);

/**
 * Return IT Wallet credentials that have been disabled remotely.
 */
export const itwDisabledCredentialsSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig => itwConfig?.disabled_credentials ?? emptyArray
);

/**
 * Return the remote config content for the iPatente CTA's visibility.
 */
export const itwIsIPatenteCtaEnabledSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig => itwConfig?.ipatente_cta_visible ?? false
);

/**
 * Return the remote config about iPatente CTA inside the MDL credential details screen.
 */
export const itwIPatenteCtaConfigSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig => itwConfig?.ipatente_cta_config
);

/**
 * Return the remote config about ipzs privacy url for the IPZS privacy screen.
 */
export const itwIpzsPrivacyUrlSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig => itwConfig?.ipzs_privacy_url
);

/**
 * Returns whether the current app version meets the minimum required to use IT Wallet.
 */
export const isItwMinAppVersionSupportedSelector = createSelector(
  itwRemoteConfigSelector,
  (itwConfig): boolean => {
    const version = itwConfig?.itw_l3?.min_app_version;
    if (!version) {
      return false;
    }
    return isVersionSupported(
      Platform.OS === "ios" ? version.ios : version.android,
      getAppVersion()
    );
  }
);

/**
 * Returns whether the current app version meets the minimum required to use Proximity presentation.
 */
export const isItwProximityMinAppVersionSupportedSelector = createSelector(
  itwRemoteConfigSelector,
  (itwConfig): boolean => {
    const version = itwConfig?.proximity?.min_app_version;
    if (!version) {
      return false;
    }
    return isVersionSupported(
      Platform.OS === "ios" ? version.ios : version.android,
      getAppVersion()
    );
  }
);

/**
 * Return the credential types that are pinned at the top of the catalogue list.
 * The order of the array determines the display order.
 */
export const itwPinnedCredentialsSelector = createSelector(
  itwRemoteConfigSelector,
  (itwConfig): ReadonlyArray<string> =>
    itwConfig?.pinned_credentials ?? emptyArray
);

/**
 * Return the credential types that are marked as new in the catalogue list.
 * New credentials are displayed first with a "NOVITÀ" badge.
 */
export const itwNewCredentialsSelector = createSelector(
  itwRemoteConfigSelector,
  (itwConfig): ReadonlyArray<string> => itwConfig?.new_credentials ?? emptyArray
);

/**
 * Return the credential types that are hidden from the catalogue list.
 */
export const itwHiddenCredentialsSelector = createSelector(
  itwRemoteConfigSelector,
  (itwConfig): ReadonlyArray<string> =>
    itwConfig?.hidden_credentials ?? emptyArray
);
