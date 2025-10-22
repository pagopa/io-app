import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import {
  NotificationModalFlow,
  SendUserType
} from "../../pushNotifications/analytics";

export type SendActivationSource = "tos_bottomsheet" | "nurturing_bottomsheet";

export const trackSendActivationModalDialog = (
  flow: NotificationModalFlow,
  send_user: SendUserType = "not_set"
) => {
  void mixpanelTrack(
    "SEND_ACTIVATION_MODAL_DIALOG",
    buildEventProperties("UX", "screen_view", {
      send_user,
      flow
    })
  );
};

export const trackSendActivationModalDialogActivationStart = (
  flow: NotificationModalFlow,
  send_user: SendUserType = "not_set"
) => {
  void mixpanelTrack(
    "SEND_ACTIVATION_MODAL_DIALOG_ACTIVATION_START",
    buildEventProperties("UX", "action", {
      send_user,
      flow
    })
  );
};
export const trackSendActivationModalDialogActivationDismissed = (
  flow: NotificationModalFlow,
  send_user: SendUserType = "not_set"
) => {
  void mixpanelTrack(
    "SEND_ACTIVATION_MODAL_DIALOG_DISMISSED",
    buildEventProperties("UX", "action", {
      send_user,
      flow
    })
  );
};
export const trackSendAcceptanceDialog = (
  flow: NotificationModalFlow,
  send_user: SendUserType = "not_set"
) => {
  void mixpanelTrack(
    "SEND_ACCEPTANCE_DIALOG",
    buildEventProperties("UX", "screen_view", {
      send_user,
      flow
    })
  );
};
export const trackSendNurturingDialog = (
  flow: NotificationModalFlow,
  send_user: SendUserType = "not_set"
) => {
  void mixpanelTrack(
    "SEND_NURTURING_DIALOG",
    buildEventProperties("UX", "screen_view", {
      send_user,
      flow
    })
  );
};
export const trackSendActivationAccepted = (
  source: SendActivationSource,
  flow: NotificationModalFlow,
  send_user: SendUserType = "not_set"
) => {
  void mixpanelTrack(
    "SEND_ACTIVATION_ACCEPTED",
    buildEventProperties("UX", "action", {
      send_user,
      flow,
      source
    })
  );
};
export const trackSendAcceptanceDialogClosure = (
  flow: NotificationModalFlow,
  send_user: SendUserType = "not_set"
) => {
  void mixpanelTrack(
    "SEND_ACCEPTANCE_DIALOG_CLOSURE",
    buildEventProperties("UX", "action", {
      send_user,
      flow
    })
  );
};
export const trackSendActivationDeclined = (
  flow: NotificationModalFlow,
  send_user: SendUserType = "not_set"
) => {
  void mixpanelTrack(
    "SEND_ACTIVATION_DECLINED",
    buildEventProperties("UX", "action", {
      send_user,
      flow
    })
  );
};
export const trackSendNurturingDialogClosure = (
  flow: NotificationModalFlow,
  send_user: SendUserType = "not_set"
) => {
  void mixpanelTrack(
    "SEND_NURTURING_DIALOG_CLOSURE",
    buildEventProperties("UX", "action", {
      send_user,
      flow
    })
  );
};
