import * as sendEvents from "../send";
import type { SendActivationSource } from "../send";
import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";
import {
  NotificationModalFlow,
  SendOpeningSource,
  SendUserType
} from "../../../pushNotifications/analytics";

const notificationModalFlowList: Array<NotificationModalFlow> = [
  "authentication",
  "send_notification_opening",
  "access"
];
const sendOpeningSources: Array<SendOpeningSource> = [
  "aar",
  "message",
  "not_set"
];
const sendUserList: Array<SendUserType> = ["mandatory", "recipient", "not_set"];
const sendActivationSourceList: Array<SendActivationSource> = [
  "tos_bottomsheet",
  "nurturing_bottomsheet"
];

jest.mock("../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

notificationModalFlowList.forEach(flow =>
  sendOpeningSources.forEach(sendOpeningSource =>
    sendUserList.forEach(send_user => {
      describe(`SEND events when flow is "${flow}" send_user is "${send_user}" and opening source is "${sendOpeningSource}"`, () => {
        beforeEach(jest.clearAllMocks);

        it(`should track "SEND_ACTIVATION_MODAL_DIALOG" event with the properties => flow = "${flow}" and send_user = "${send_user}"`, () => {
          sendEvents.trackSendActivationModalDialog(
            flow,
            sendOpeningSource,
            send_user
          );

          expect(mixpanelTrack).toHaveBeenCalledWith(
            "SEND_ACTIVATION_MODAL_DIALOG",
            buildEventProperties("UX", "screen_view", {
              flow,
              opening_source: "not_set",
              send_user
            })
          );
        });
        it(`should track "SEND_ACTIVATION_MODAL_DIALOG_ACTIVATION_START" event with the properties => flow = "${flow}" and send_user = "${send_user}"`, () => {
          sendEvents.trackSendActivationModalDialogActivationStart(
            flow,
            sendOpeningSource,
            send_user
          );

          expect(mixpanelTrack).toHaveBeenCalledWith(
            "SEND_ACTIVATION_MODAL_DIALOG_ACTIVATION_START",
            buildEventProperties("UX", "action", {
              flow,
              opening_source: "not_set",
              send_user
            })
          );
        });
        it(`should track "SEND_ACTIVATION_MODAL_DIALOG_DISMISSED" event with the properties => flow = "${flow}" and send_user = "${send_user}"`, () => {
          sendEvents.trackSendActivationModalDialogActivationDismissed(
            flow,
            sendOpeningSource,
            send_user
          );

          expect(mixpanelTrack).toHaveBeenCalledWith(
            "SEND_ACTIVATION_MODAL_DIALOG_DISMISSED",
            buildEventProperties("UX", "action", {
              flow,
              opening_source: "not_set",
              send_user
            })
          );
        });
      });
    })
  )
);

notificationModalFlowList.forEach(flow =>
  sendUserList.forEach(send_user => {
    describe(`SEND events when flow is "${flow}" and send_user is "${send_user}"`, () => {
      beforeEach(jest.clearAllMocks);

      it(`should track "SEND_ACCEPTANCE_DIALOG" event with the properties => flow = "${flow}" and send_user = "${send_user}"`, () => {
        sendEvents.trackSendAcceptanceDialog(flow, send_user);

        expect(mixpanelTrack).toHaveBeenCalledWith(
          "SEND_ACCEPTANCE_DIALOG",
          buildEventProperties("UX", "screen_view", {
            flow,
            send_user
          })
        );
      });
      it(`should track "SEND_NURTURING_DIALOG" event with the properties => flow = "${flow}" and send_user = "${send_user}"`, () => {
        sendEvents.trackSendNurturingDialog(flow, send_user);

        expect(mixpanelTrack).toHaveBeenCalledWith(
          "SEND_NURTURING_DIALOG",
          buildEventProperties("UX", "screen_view", {
            flow,
            send_user
          })
        );
      });
      it.each(sendActivationSourceList)(
        `should track "SEND_ACTIVATION_ACCEPTED" event with the properties => flow = "${flow}", send_user = "${send_user}" and source = "%s"`,
        source => {
          sendEvents.trackSendActivationAccepted(source, flow, send_user);

          expect(mixpanelTrack).toHaveBeenCalledWith(
            "SEND_ACTIVATION_ACCEPTED",
            buildEventProperties("UX", "action", {
              flow,
              send_user,
              source
            })
          );
        }
      );
      it(`should track "SEND_ACCEPTANCE_DIALOG_CLOSURE" event with the properties => flow = "${flow}" and send_user = "${send_user}"`, () => {
        sendEvents.trackSendAcceptanceDialogClosure(flow, send_user);

        expect(mixpanelTrack).toHaveBeenCalledWith(
          "SEND_ACCEPTANCE_DIALOG_CLOSURE",
          buildEventProperties("UX", "action", {
            flow,
            send_user
          })
        );
      });
      it(`should track "SEND_ACTIVATION_DECLINED" event with the properties => flow = "${flow}" and send_user = "${send_user}"`, () => {
        sendEvents.trackSendActivationDeclined(flow, send_user);

        expect(mixpanelTrack).toHaveBeenCalledWith(
          "SEND_ACTIVATION_DECLINED",
          buildEventProperties("UX", "action", {
            flow,
            send_user
          })
        );
      });
      it(`should track "SEND_NURTURING_DIALOG_CLOSURE" event with the properties => flow = "${flow}" and send_user = "${send_user}"`, () => {
        sendEvents.trackSendNurturingDialogClosure(flow, send_user);

        expect(mixpanelTrack).toHaveBeenCalledWith(
          "SEND_NURTURING_DIALOG_CLOSURE",
          buildEventProperties("UX", "action", {
            flow,
            send_user
          })
        );
      });
    });
  })
);
