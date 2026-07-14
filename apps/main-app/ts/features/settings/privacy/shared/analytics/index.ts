import { mixpanelTrack } from "../../../../../mixpanel";
import { updateMixpanelProfileProperties } from "../../../../../mixpanelConfig/profileProperties";
import { GlobalState } from "../../../../../store/reducers/types";
import { buildEventProperties, FlowType } from "../../../../../utils/analytics";

export async function trackTosAccepted(
  acceptedTosVersion: number,
  flow: FlowType,
  state: GlobalState
) {
  await updateMixpanelProfileProperties(state, {
    property: "TOS_ACCEPTED_VERSION",
    value: acceptedTosVersion
  });
  mixpanelTrack(
    "TOS_ACCEPTED",
    buildEventProperties(
      "UX",
      "action",
      {
        acceptedTosVersion
      },
      flow
    )
  );
}

export function trackTosScreen(flow: FlowType) {
  void mixpanelTrack(
    "TOS",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackToSWebViewError(flow: FlowType) {
  void mixpanelTrack(
    "TOS_LOAD_FAILURE",
    buildEventProperties("KO", undefined, { flow })
  );
}
export function trackToSWebViewErrorRetry(flow: FlowType) {
  void mixpanelTrack(
    "TOS_LOAD_RETRY",
    buildEventProperties("UX", "action", undefined, flow)
  );
}
