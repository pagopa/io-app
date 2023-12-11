import { mixpanelTrack } from "../../../../mixpanel";
import { FlowType, buildEventProperties } from "../../../../utils/analytics";

export function trackMixpanelSetEnabled(value: boolean, flow: FlowType) {
  void mixpanelTrack(
    "MIXPANEL_SET_ENABLED",
    buildEventProperties(
      "UX",
      "action",
      {
        value
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
