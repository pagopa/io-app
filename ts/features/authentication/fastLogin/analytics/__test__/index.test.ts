import {
  trackLoginSessionTimeoutPostPin,
  trackLoginSessionTimeoutPrePin
} from "..";
import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../../utils/analytics", () => ({
  buildEventProperties: jest.fn()
}));

jest.mock("../../../../../mixpanelConfig/profileProperties", () => ({
  updateMixpanelProfileProperties: jest.fn()
}));

describe("analytics/index.ts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("tracks Login Session Timeout Pre Pin", () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackLoginSessionTimeoutPrePin();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_SESSION_TIMEOUT_PRE_PIN",
      props
    );
  });

  it("tracks Login Session Timeout Post Pin", async () => {
    const props = { test: true };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackLoginSessionTimeoutPostPin();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_SESSION_TIMEOUT_POST_PIN_V2",
      props
    );
  });
});
