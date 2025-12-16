import { mixpanelTrack } from "../../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../../store/reducers/types";
import { FlowType, buildEventProperties } from "../../../../../utils/analytics";

export enum TrackingInfo {
  WHY = "finalità",
  FIND_OUT_MORE = "sicurezza",
  SUPPLIERS = "fornitori",
  TOS = "ToS"
}

export async function trackMixpanelSetEnabled(
  isEnabled: boolean,
  flow: FlowType,
  state: GlobalState
) {
  await updateMixpanelProfileProperties(state, {
    property: "TRACKING",
    value: isEnabled ? "accepted" : "declined"
  });
  void mixpanelTrack(
    "MIXPANEL_SET_ENABLED",
    buildEventProperties(
      "UX",
      "action",
      {
        value: isEnabled
      },
      flow
    )
  );
}

export function trackMixpanelDeclined(flow: FlowType) {
  void mixpanelTrack(
    "PREFERENCE_MIXPANEL_DECLINED",
    buildEventProperties("UX", "action", undefined, flow)
  );
}

export function trackMixPanelTrackingInfo(flow: FlowType, info: TrackingInfo) {
  void mixpanelTrack(
    "TRACKING_INFO",
    buildEventProperties("UX", "action", { info }, flow)
  );
}

export function trackMixpanelNotNowSelected(flow: FlowType) {
  void mixpanelTrack(
    "MIXPANEL_NOT_NOW_SELECTED",
    buildEventProperties("UX", "action", undefined, flow)
  );
}

export function trackMixpanelConsentBottomsheet(flow: FlowType) {
  void mixpanelTrack(
    "MIXPANEL_CONSENT_BOTTOMSHEET",
    buildEventProperties("UX", "action", undefined, flow)
  );
}

export function trackMixpanelConsentCancel(flow: FlowType) {
  void mixpanelTrack(
    "MIXPANEL_CONSENT_CANCEL",
    buildEventProperties("UX", "action", undefined, flow)
  );
}
