import { mixpanelTrack } from "../../../../../../mixpanel";
import {
  FlowType,
  buildEventProperties
} from "../../../../../../utils/analytics";

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
