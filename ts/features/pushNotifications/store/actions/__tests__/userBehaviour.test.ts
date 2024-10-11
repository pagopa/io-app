import { setEngagementScreenShown } from "../userBehaviour";

describe("setEngagementScreenShown", () => {
  it("Shoudl match expected values", () => {
    const action = setEngagementScreenShown();
    expect(action.type).toBe("SET_ENGAGEMENT_SCREEN_SHOWN");
    expect(action.payload).toBe(undefined);
  });
});
