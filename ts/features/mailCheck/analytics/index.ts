import { mixpanelTrack } from "../../../mixpanel";
import { FlowType, buildEventProperties } from "../../../utils/analytics";

export function trackEmailNotAlreadyConfirmed(flow: FlowType) {
  void mixpanelTrack(
    "EMAIL_VALIDATION_STOP",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackEmailAlreadyTaken(flow: FlowType) {
  void mixpanelTrack(
    "EMAIL_DUPLICATE_STOP",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackEmailDuplicateEditingConfirm(flow: FlowType) {
  void mixpanelTrack(
    "EMAIL_DUPLICATE_EDITING_CONFIRM",
    buildEventProperties("UX", "action", undefined, flow)
  );
}
