import * as Mixpanel from "../../../../../../mixpanel";
import {
  ITW_PROXIMITY_ACTIONS_EVENTS,
  ITW_PROXIMITY_ERRORS_EVENTS,
  ITW_PROXIMITY_SCREENVIEW_EVENTS,
  ITW_PROXIMITY_TECH_EVENTS
} from "../enum";
import {
  trackItwConsentManagement,
  trackItwConsentManagementDetail,
  trackItwCredentialManageConsent,
  trackItwProximityContinuePresentation,
  trackItwProximityDataShare,
  trackItwProximityMandatoryCredentialMissing,
  trackItwProximityNfcStart,
  trackItwProximityPresentationCompleted,
  trackItwProximityRPGenericFailure,
  trackItwProximityRpNotTrusted,
  trackItwProximityStart,
  trackItwProximityTimeout,
  trackItwProximityUnexpectedFailure,
  trackItwRevokeConsent,
  trackItwRevokeConsentOperationBlock,
  trackItwRevokeConsentOperationBlockAction
} from "../index";

describe("proximity analytics", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    {
      name: "trackItwProximityStart with qr_code flow",
      track: () => trackItwProximityStart({ proximity_flow: "qr_code" }),
      eventName: ITW_PROXIMITY_TECH_EVENTS.ITW_PROXIMITY_START,
      properties: {
        event_category: "TECH",
        event_type: undefined,
        flow: undefined,
        proximity_flow: "qr_code"
      }
    },
    {
      name: "trackItwProximityStart with nfc flow",
      track: () => trackItwProximityStart({ proximity_flow: "nfc" }),
      eventName: ITW_PROXIMITY_TECH_EVENTS.ITW_PROXIMITY_START,
      properties: {
        event_category: "TECH",
        event_type: undefined,
        flow: undefined,
        proximity_flow: "nfc"
      }
    },
    {
      name: "trackItwProximityNfcStart",
      track: () => trackItwProximityNfcStart(),
      eventName: ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_NFC_START,
      properties: {
        event_category: "UX",
        event_type: "action",
        flow: undefined
      }
    },
    {
      name: "trackItwProximityDataShare",
      track: () => trackItwProximityDataShare({ proximity_flow: "nfc" }),
      eventName: ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_DATA_SHARE,
      properties: {
        event_category: "UX",
        event_type: "screen_view",
        flow: undefined,
        proximity_flow: "nfc"
      }
    },
    {
      name: "trackItwProximityPresentationCompleted",
      track: () =>
        trackItwProximityPresentationCompleted({ proximity_flow: "qr_code" }),
      eventName: ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_PROXIMITY_UX_SUCCESS,
      properties: {
        event_category: "UX",
        event_type: "screen_view",
        flow: undefined,
        proximity_flow: "qr_code"
      }
    },
    {
      name: "trackItwProximityContinuePresentation",
      track: () =>
        trackItwProximityContinuePresentation({ proximity_flow: "nfc" }),
      eventName: ITW_PROXIMITY_ACTIONS_EVENTS.ITW_PROXIMITY_UX_CONVERSION,
      properties: {
        event_category: "UX",
        event_type: "action",
        flow: undefined,
        proximity_flow: "nfc"
      }
    },
    {
      name: "trackItwCredentialManageConsent",
      track: () => trackItwCredentialManageConsent({ credential: "ITW_PG_V3" }),
      eventName: ITW_PROXIMITY_ACTIONS_EVENTS.ITW_CREDENTIAL_MANAGE_CONSENT,
      properties: {
        credential: "ITW_PG_V3",
        event_category: "UX",
        event_type: "action",
        flow: undefined
      }
    },
    {
      name: "trackItwConsentManagement",
      track: () => trackItwConsentManagement({ credential: "ITW_PG_V3" }),
      eventName: ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_CONSENT_MANAGEMENT,
      properties: {
        credential: "ITW_PG_V3",
        event_category: "UX",
        event_type: "screen_view",
        flow: undefined
      }
    },
    {
      name: "trackItwConsentManagementDetail",
      track: () => trackItwConsentManagementDetail(),
      eventName: ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_CONSENT_MANAGEMENT_DETAIL,
      properties: {
        event_category: "UX",
        event_type: "screen_view",
        flow: undefined
      }
    },
    {
      name: "trackItwRevokeConsent",
      track: () => trackItwRevokeConsent(),
      eventName: ITW_PROXIMITY_ACTIONS_EVENTS.ITW_REVOKE_CONSENT,
      properties: {
        event_category: "UX",
        event_type: "action",
        flow: undefined
      }
    },
    {
      name: "trackItwRevokeConsentOperationBlock",
      track: () => trackItwRevokeConsentOperationBlock(),
      eventName:
        ITW_PROXIMITY_SCREENVIEW_EVENTS.ITW_REVOKE_CONSENT_OPERATION_BLOCK,
      properties: {
        event_category: "UX",
        event_type: "screen_view",
        flow: undefined
      }
    },
    {
      name: "trackItwProximityRPGenericFailure with nfc flow",
      track: () =>
        trackItwProximityRPGenericFailure({
          proximity_flow: "nfc",
          proximity_sharing_status: "post",
          reason: "reason",
          type: "RELYING_PARTY_GENERIC"
        }),
      eventName: ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_GENERIC_ERROR,
      properties: {
        event_category: "KO",
        event_type: "screen_view",
        flow: undefined,
        proximity_flow: "nfc",
        proximity_sharing_status: "post",
        reason: "reason",
        type: "RELYING_PARTY_GENERIC"
      }
    },
    {
      name: "trackItwProximityTimeout with qr_code flow",
      track: () =>
        trackItwProximityTimeout({
          proximity_flow: "qr_code",
          reason: "reason",
          type: "TIMEOUT"
        }),
      eventName: ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_TIMEOUT,
      properties: {
        event_category: "KO",
        event_type: "screen_view",
        flow: undefined,
        proximity_flow: "qr_code",
        reason: "reason",
        type: "TIMEOUT"
      }
    },
    {
      name: "trackItwProximityUnexpectedFailure with nfc flow",
      track: () =>
        trackItwProximityUnexpectedFailure({
          origin: "origin",
          proximity_flow: "nfc",
          reason: "reason",
          type: "UNEXPECTED"
        }),
      eventName: ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_UNEXPECTED_FAILURE,
      properties: {
        event_category: "KO",
        event_type: "screen_view",
        flow: undefined,
        origin: "origin",
        proximity_flow: "nfc",
        reason: "reason",
        type: "UNEXPECTED"
      }
    },
    {
      name: "trackItwProximityRpNotTrusted with qr_code flow",
      track: () =>
        trackItwProximityRpNotTrusted({
          proximity_flow: "qr_code",
          reason: "reason",
          type: "UNTRUSTED_RP"
        }),
      eventName: ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_RP_NOT_TRUSTED,
      properties: {
        event_category: "KO",
        event_type: "screen_view",
        flow: undefined,
        proximity_flow: "qr_code",
        reason: "reason",
        type: "UNTRUSTED_RP"
      }
    },
    {
      name: "trackItwProximityMandatoryCredentialMissing with nfc flow",
      track: () =>
        trackItwProximityMandatoryCredentialMissing({ proximity_flow: "nfc" }),
      eventName:
        ITW_PROXIMITY_ERRORS_EVENTS.ITW_PROXIMITY_MANDATORY_CREDENTIAL_MISSING,
      properties: {
        event_category: "KO",
        event_type: "screen_view",
        flow: undefined,
        proximity_flow: "nfc"
      }
    },
    {
      name: "trackItwRevokeConsentOperationBlockAction",
      track: () => trackItwRevokeConsentOperationBlockAction("confirm"),
      eventName:
        ITW_PROXIMITY_ACTIONS_EVENTS.ITW_REVOKE_CONSENT_OPERATION_BLOCK_ACTION,
      properties: {
        event_category: "UX",
        event_type: "action",
        flow: undefined,
        user_action: "confirm"
      }
    }
  ])(
    "$name tracks the expected event and properties",
    ({ track, eventName, properties }) => {
      const spiedOnMixpanelTrack = jest
        .spyOn(Mixpanel, "mixpanelTrack")
        .mockImplementation();

      track();

      expect(spiedOnMixpanelTrack).toHaveBeenCalledWith(eventName, properties);
    }
  );
});
