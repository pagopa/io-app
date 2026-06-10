import { trackTourGuideAction } from "../index";
import { mixpanelTrack } from "../../../../mixpanel";
import { buildEventProperties } from "../../../../utils/analytics";

jest.mock("../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../utils/analytics", () => ({
  buildEventProperties: jest.fn().mockReturnValue({ mocked: true })
}));

const mockMixpanelTrack = mixpanelTrack as jest.Mock;
const mockBuildEventProperties = buildEventProperties as jest.Mock;

describe("trackTourGuideAction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const actions = ["shown", "next", "back", "close", "conclude"] as const;

  actions.forEach(action => {
    it(`calls mixpanelTrack with TOUR_GUIDE event for action "${action}"`, () => {
      trackTourGuideAction("myTour", action);

      expect(mockBuildEventProperties).toHaveBeenCalledWith("UX", "action", {
        action,
        tour_guide_id: "myTour"
      });

      expect(mockMixpanelTrack).toHaveBeenCalledWith("TOUR_GUIDE", {
        mocked: true
      });
    });
  });
});
