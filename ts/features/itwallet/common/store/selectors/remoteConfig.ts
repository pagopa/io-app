import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import { Platform } from "react-native";
import { createSelector } from "reselect";
import { GlobalState } from "../../../../../store/reducers/types";
import {
  getAppVersion,
  isVersionSupported
} from "../../../../../utils/appVersion";

const emptyArray: ReadonlyArray<string> = []; // to avoid unnecessary rerenders

const itwRemoteConfigSelector = (state: GlobalState) =>
  pipe(
    state.remoteConfig,
    O.map(config => config.itw)
  );

/**
 * Returns the remote config for IT-WALLET
 */
export const isItwEnabledSelector = createSelector(
  itwRemoteConfigSelector,
  (itwConfig): boolean =>
    pipe(
      itwConfig,
      O.map(
        itw =>
          isVersionSupported(
            Platform.OS === "ios"
              ? itw.min_app_version.ios
              : itw.min_app_version.android,
            getAppVersion()
          ) && itw.enabled
      ),
      O.getOrElse(() => false)
    )
);

/**
 * Returns the authentication methods that are disabled.
 * If there is no data, an empty array is returned as the default value.
 */
export const itwDisabledIdentificationMethodsSelector = createSelector(
  itwRemoteConfigSelector,
  (itwConfig): ReadonlyArray<string> =>
    pipe(
      itwConfig,
      O.chainNullableK(itw => itw.disabled_identification_methods),
      O.getOrElse(() => emptyArray)
    )
);

/**
 * Return whether the IT Wallet feedback banner is remotely enabled.
 */
export const isItwFeedbackBannerEnabledSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig =>
    pipe(
      itwConfig,
      O.map(itw => itw.feedback_banner_visible),
      O.getOrElse(() => false)
    )
);

/**
 * Return whether the Wallet activation is disabled.
 * This is purely a "cosmetic" configuration to disable UI elements,
 * it does not disable the entire IT Wallet feature.
 */
export const itwIsActivationDisabledSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig =>
    pipe(
      itwConfig,
      O.chainNullableK(itw => itw.wallet_activation_disabled),
      O.getOrElse(() => false)
    )
);

/**
 * Return IT Wallet credentials that have been disabled remotely.
 */
export const itwDisabledCredentialsSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig =>
    pipe(
      itwConfig,
      O.chainNullableK(itw => itw.disabled_credentials),
      O.getOrElse(() => emptyArray)
    )
);

/**
 * Return the remote config content for the iPatente CTA's visibility.
 */
export const itwIsIPatenteCtaEnabledSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig =>
    pipe(
      itwConfig,
      O.map(itw => itw.ipatente_cta_visible),
      O.getOrElse(() => false)
    )
);

/**
 * Return the remote config about iPatente CTA inside the MDL credential details screen.
 */
export const itwIPatenteCtaConfigSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig =>
    pipe(
      itwConfig,
      O.map(itw => itw.ipatente_cta_config),
      O.toUndefined
    )
);

/**
 * Return the remote config about ipzs privacy url for the IPZS privacy screen.
 */
export const itwIPatentePrivacyUrlSelector = createSelector(
  itwRemoteConfigSelector,
  itwConfig =>
    pipe(
      itwConfig,
      O.map(itw => itw.ipzs_privacy_url),
      O.toUndefined
    )
);
