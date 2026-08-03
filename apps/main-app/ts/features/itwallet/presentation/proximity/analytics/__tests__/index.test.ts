import * as Mixpanel from "../../../../../../mixpanel";
import {
  ITW_PROXIMITY_ACTIONS_EVENTS,
  ITW_PROXIMITY_SCREENVIEW_EVENTS,
  ITW_PROXIMITY_TECH_EVENTS
} from "../enum";
import {
  trackItwProximityContinuePresentation,
  trackItwProximityDataShare,
  trackItwProximityNfcStart,
  trackItwProximityPresentationCompleted,
  trackItwProximityStart
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
