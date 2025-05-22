import { getType } from "typesafe-actions";
import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import { Action } from "../../../store/actions/types.ts";
import {
  resetOfflineAccessReason,
  setOfflineAccessReason
} from "../store/actions";
import { GlobalState } from "../../../store/reducers/types.ts";
import { updateMixpanelSuperProperties } from "../../../mixpanelConfig/superProperties.ts";

export function trackIngressServicesSlowDown() {
  void mixpanelTrack(
    "INGRESS_SERVICES_SLOW_DOWN",
    buildEventProperties("KO", undefined)
  );
}

export function trackIngressTimeout() {
  void mixpanelTrack("INGRESS_TIMEOUT", buildEventProperties("KO", undefined));
}

export function trackIngressCdnSystemError() {
  void mixpanelTrack(
    "INGRESS_CDN_SYSTEM_ERROR",
    buildEventProperties("KO", undefined)
  );
}

export function trackIngressNoInternetConnection() {
  void mixpanelTrack(
    "INGRESS_NO_INTERNET_CONNECTION",
    buildEventProperties("KO", undefined)
  );
}

/**
 * Track the reason for offline access on Mixpanel
 * @param action - The action that was dispatched
 * @param state - The current state of the application
 */
export const trackOfflineAccessReason = (
  action: Action,
  state: GlobalState
): void | ReadonlyArray<null> => {
  switch (action.type) {
    case getType(setOfflineAccessReason):
      return void updateMixpanelSuperProperties(state, {
        property: "OFFLINE_ACCESS_REASON",
        value: action.payload
      });
    case getType(resetOfflineAccessReason):
      return void updateMixpanelSuperProperties(state, {
        property: "OFFLINE_ACCESS_REASON",
        value: "not_available"
      });
  }
};
