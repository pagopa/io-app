import * as Mixpanel from "../../../../../mixpanel";
import { ITW_LIFECYCLE_TECH_EVENTS } from "../enum";
import { trackItwWalletInstanceResetFailure } from "../index";

describe("lifecycle analytics", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test.each([
    ["Error", new Error("reset error"), "reset error"],
    ["non-Error value", "reset error", "reset error"]
  ])("tracks a wallet reset failure from an %s", (_, reason, expected) => {
    const mixpanelTrack = jest
      .spyOn(Mixpanel, "mixpanelTrack")
      .mockImplementation();

    trackItwWalletInstanceResetFailure(reason);

    expect(mixpanelTrack).toHaveBeenCalledWith(
      ITW_LIFECYCLE_TECH_EVENTS.ITW_WALLET_INSTANCE_RESET_FAILURE,
      {
        event_category: "TECH",
        event_type: undefined,
        flow: undefined,
        reason: expected
      }
    );
  });
});
