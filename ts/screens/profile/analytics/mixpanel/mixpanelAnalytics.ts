import { mixpanelTrack } from "../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../store/reducers/types";
import { FlowType, buildEventProperties } from "../../../../utils/analytics";

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
