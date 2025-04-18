import { loadContextualHelpData, loadIdps } from "../../actions/content";
import * as mixpanelTrackModule from "../../../mixpanel";
import { trackContentAction } from "../contentAnalytics";

// Mock the mixpanelTrack function
jest.mock("../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

const mockMixpanelTrack = mixpanelTrackModule.mixpanelTrack as jest.Mock;

describe("trackContentAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should track loadContextualHelpData.request action", () => {
    const action = loadContextualHelpData.request();

    trackContentAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "LOAD_CONTEXTUAL_HELP_TEXT_DATA_REQUEST"
    );
  });

  it("should track loadContextualHelpData.success action", () => {
    const action = loadContextualHelpData.success({
      version: 1,
      it: {
        idps: {},
        screens: []
      },
      en: {
        idps: {},
        screens: []
      }
    });

    trackContentAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "LOAD_CONTEXTUAL_HELP_TEXT_DATA_SUCCESS"
    );
  });

  it("should track loadContextualHelpData.failure action with payload", () => {
    const errorPayload = Error("");
    const action = loadContextualHelpData.failure(errorPayload);

    trackContentAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe(
      "LOAD_CONTEXTUAL_HELP_TEXT_DATA_FAILURE"
    );
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      reason: errorPayload
    });
  });

  it("should track loadIdps.request action", () => {
    const action = loadIdps.request();

    trackContentAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("LOAD_IDPS_REQUEST");
  });

  it("should track loadIdps.success action", () => {
    const action = loadIdps.success({ items: [] });

    trackContentAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("LOAD_IDPS_SUCCESS");
  });

  it("should track loadIdps.failure action with payload", () => {
    const errorPayload = Error("");
    const action = loadIdps.failure(errorPayload);

    trackContentAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(1);
    expect(mockMixpanelTrack.mock.calls[0].length).toBe(2);
    expect(mockMixpanelTrack.mock.calls[0][0]).toBe("LOAD_IDPS_FAILURE");
    expect(mockMixpanelTrack.mock.calls[0][1]).toEqual({
      reason: errorPayload
    });
  });

  it("should not track unhandled action types", () => {
    const action = { type: "SOME_OTHER_ACTION" } as any;

    trackContentAction(action);

    expect(mockMixpanelTrack.mock.calls.length).toBe(0);
  });
});
