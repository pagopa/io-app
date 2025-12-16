import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import { Platform } from "react-native";
import { createSelector } from "reselect";
import { getType } from "typesafe-actions";
import { Action } from "../../../../store/actions/types";
import { GlobalState } from "../../../../store/reducers/types";
import {
  getAppVersion,
  isVersionSupported
} from "../../../../utils/appVersion";
import { IOVersionInfo, IOVersionPerPlatform } from "../../types/IOVersionInfo";
import {
  versionInfoLoadFailure,
  versionInfoLoadSuccess
} from "../actions/versionInfo";

export type VersionInfoState = IOVersionInfo | null;

export const versionInfoReducer = (
  state: VersionInfoState = null,
  action: Action
): VersionInfoState => {
  switch (action.type) {
    case getType(versionInfoLoadSuccess):
      return action.payload;
    case getType(versionInfoLoadFailure):
      return null;
    default:
      return state;
  }
};

export const versionInfoDataSelector = (state: GlobalState) =>
  state.versionInfo;

/**
 * Pick the platform related app version, starting from IOVersionPerPlatform
 * @param versionPerPlatform
 */
const selectVersion = (
  versionPerPlatform: IOVersionPerPlatform | undefined
): O.Option<string> =>
  O.fromNullable(
    Platform.select({
      ios: versionPerPlatform?.ios,
      android: versionPerPlatform?.android
    })
  );

const isSupported = (versionPerPlatform: IOVersionPerPlatform | undefined) =>
  pipe(
    selectVersion(versionPerPlatform),
    O.map(v => isVersionSupported(v, getAppVersion())),
    O.getOrElse(() => true)
  );

/**
 * Return true if the app needs to be updated and the user cannot continue to use the app without an update
 * Since the getAppVersion cannot change during the app execution, we can avoid forwarding it from the outside
 * @param state
 */
export const isAppSupportedSelector = createSelector(
  [versionInfoDataSelector],
  (versionInfo): boolean => isSupported(versionInfo?.min_app_version)
);

/**
 * Return true if the app needs to be updated in order to use the wallet and payments.
 * If true, the user cannot use the wallet and can't make payments
 * Since the getAppVersion cannot change during the app execution, we can avoid forwarding it from the outside
 * @param state
 */
export const isPagoPaSupportedSelector = (state: GlobalState) =>
  pipe(
    state,
    versionInfoDataSelector,
    versionInfoStatusOrNull => versionInfoStatusOrNull?.min_app_version_pagopa,
    isSupported
  );
