import { applicationChangeState } from "../../../../../store/actions/application";
import {
  setEngagementScreenShown,
  setPushPermissionsRequestDuration
} from "../../actions/userBehaviour";
import { INITIAL_STATE, userBehaviourReducer } from "../userBehaviour";

describe("userBehaviourReducer", () => {
  it("INITIAL_STATE should match expected values", () => {
    expect(INITIAL_STATE.engagementScreenShown).toBe(false);
  });
  it("Should match snapshot", () => {
    const userBehaviourState = userBehaviourReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(userBehaviourState).toMatchSnapshot();
  });
  it("'engagementScreenShown' should be 'true' after receiving 'setEngagementScreenShown'", () => {
    const userBehaviourState = userBehaviourReducer(
      undefined,
      setEngagementScreenShown()
    );
    expect(userBehaviourState.engagementScreenShown).toBe(true);
  });
  it("'pushNotificationPermissionsRequestDuration' should be '100' after receiving 'setPushPermissionsRequestDuration(100)'", () => {
    const userBehaviourState = userBehaviourReducer(
      undefined,
      setPushPermissionsRequestDuration(100)
    );
    expect(userBehaviourState.pushNotificationPermissionsRequestDuration).toBe(
      100
    );
  });
});
