import {
  trackLoginSessionOptIn,
  trackLoginSessionOptInInfo,
  trackLoginSessionOptIn365,
  trackLoginSessionOptIn30
} from "../optinAnalytics";
import { mixpanelTrack } from "../../../../../mixpanel";
import { buildEventProperties } from "../../../../../utils/analytics";
import { updateMixpanelProfileProperties } from "../../../../../mixpanelConfig/profileProperties";
import { updateMixpanelSuperProperties } from "../../../../../mixpanelConfig/superProperties";

jest.mock("../../../../../mixpanel", () => ({
  mixpanelTrack: jest.fn()
}));

jest.mock("../../../../../utils/analytics", () => ({
  buildEventProperties: jest.fn()
}));

jest.mock("../../../../../mixpanelConfig/profileProperties", () => ({
  updateMixpanelProfileProperties: jest.fn()
}));

jest.mock("../../../../../mixpanelConfig/superProperties", () => ({
  updateMixpanelSuperProperties: jest.fn()
}));

describe("optinAnalytics", () => {
  const mockState = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("tracks Login Session Opt-In", () => {
    const props = { foo: "bar" };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackLoginSessionOptIn();
    expect(mixpanelTrack).toHaveBeenCalledWith("LOGIN_SESSION_OPTIN_2", props);
  });

  it("tracks Login Session Opt-In Info", () => {
    const props = { foo: "bar" };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    trackLoginSessionOptInInfo();
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_SESSION_OPTIN_INFO",
      props
    );
  });

  it("tracks Login Session Opt-In 365", async () => {
    const props = { foo: "bar" };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    await trackLoginSessionOptIn365(mockState);
    expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(mockState, {
      property: "LOGIN_SESSION",
      value: "365"
    });
    expect(updateMixpanelSuperProperties).toHaveBeenCalledWith(mockState, {
      property: "LOGIN_SESSION",
      value: "365"
    });
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_SESSION_OPTIN_365_SELECTED",
      props
    );
  });

  it("tracks Login Session Opt-In 30", async () => {
    const props = { foo: "bar" };
    (buildEventProperties as jest.Mock).mockReturnValue(props);
    await trackLoginSessionOptIn30(mockState);
    expect(updateMixpanelProfileProperties).toHaveBeenCalledWith(mockState, {
      property: "LOGIN_SESSION",
      value: "30"
    });
    expect(updateMixpanelSuperProperties).toHaveBeenCalledWith(mockState, {
      property: "LOGIN_SESSION",
      value: "30"
    });
    expect(mixpanelTrack).toHaveBeenCalledWith(
      "LOGIN_SESSION_OPTIN_30_SELECTED",
      props
    );
  });
});
