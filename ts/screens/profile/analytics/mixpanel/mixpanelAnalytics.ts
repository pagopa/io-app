import { mixpanelTrack } from "../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../store/reducers/types";
import { FlowType, buildEventProperties } from "../../../../utils/analytics";

export async function trackMixpanelSetEnabled(
  enabled: boolean,
  flow: FlowType,
  state: GlobalState
) {
  await updateMixpanelProfileProperties(state, {
    property: "TRACKING",
    value: enabled ? "accepted" : "declined"
  });
  void mixpanelTrack(
    "MIXPANEL_SET_ENABLED",
    buildEventProperties(
      "UX",
      "action",
      {
        value: enabled
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
