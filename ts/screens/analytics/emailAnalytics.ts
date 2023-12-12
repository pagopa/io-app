import { mixpanelTrack } from "../../mixpanel";
import { FlowType, buildEventProperties } from "../../utils/analytics";

export function trackEmailEditing(flow: FlowType) {
  void mixpanelTrack(
    "EMAIL_EDITING",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackEmailValidation(flow: FlowType) {
  void mixpanelTrack(
    "EMAIL_VALIDATION",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackEmailDuplicateEditing(flow: FlowType) {
  void mixpanelTrack(
    "EMAIL_DUPLICATE_EDITING",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackEmailEditingError(flow: FlowType) {
  void mixpanelTrack(
    "EMAIL_EDITING_ERROR",
    buildEventProperties("UX", "error", undefined, flow)
  );
}

export function trackEmailValidationSuccess(flow: FlowType) {
  void mixpanelTrack(
    "EMAIL_VALIDATION_SUCCESS",
    buildEventProperties("UX", "screen_view", undefined, flow)
  );
}

export function trackEmailValidationSuccessConfirmed(flow: FlowType) {
  void mixpanelTrack(
    "EMAIL_VALIDATION_SUCCESS_CONFIRMED",
    buildEventProperties("UX", "action", undefined, flow)
  );
}
