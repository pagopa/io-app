import { mixpanelTrack } from "../../../mixpanel";
import { buildEventProperties } from "../../../utils/analytics";
import {
  NotificationModalFlow,
  SendOpeningSource,
  SendUserType
} from "../../pushNotifications/analytics";

export type SendActivationSource = "tos_bottomsheet" | "nurturing_bottomsheet";

export const trackSendActivationModalDialog = (
  flow: NotificationModalFlow,
  sendSource: SendOpeningSource = "not_set",
  sendUser: SendUserType = "not_set"
) => {
  const eventName = "SEND_ACTIVATION_MODAL_DIALOG";
  const properties = buildEventProperties("UX", "screen_view", {
    flow,
    opening_source: sendSource,
    send_user: sendUser
  });
  mixpanelTrack(eventName, properties);
};

export const trackSendActivationModalDialogActivationStart = (
  flow: NotificationModalFlow,
  sendSource: SendOpeningSource = "not_set",
  sendUser: SendUserType = "not_set"
) => {
  const eventName = "SEND_ACTIVATION_MODAL_DIALOG_ACTIVATION_START";
  const properties = buildEventProperties("UX", "action", {
    flow,
    opening_source: sendSource,
    send_user: sendUser
  });
  mixpanelTrack(eventName, properties);
};

export const trackSendActivationModalDialogActivationDismissed = (
  flow: NotificationModalFlow,
  sendSource: SendOpeningSource = "not_set",
  sendUser: SendUserType = "not_set"
) => {
  const eventName = "SEND_ACTIVATION_MODAL_DIALOG_DISMISSED";
  const properties = buildEventProperties("UX", "action", {
    flow,
    opening_source: sendSource,
    send_user: sendUser
  });
  mixpanelTrack(eventName, properties);
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
