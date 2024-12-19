import {
  setEngagementScreenShown,
  setPushPermissionsRequestDuration
} from "../environment";

describe("setPushPermissionsRequestDuration", () => {
  it("Should match expected values", () => {
    const action = setPushPermissionsRequestDuration(1000);
    expect(action.type).toBe("SET_PUSH_PERMISSIONS_REQUEST_DURATION");
    expect(action.payload).toBe(1000);
  });
});
describe("setEngagementScreenShown", () => {
  it("Should match expected values", () => {
    const action = setEngagementScreenShown();
    expect(action.type).toBe("SET_ENGAGEMENT_SCREEN_SHOWN");
    expect(action.payload).toBe(undefined);
  });
});
