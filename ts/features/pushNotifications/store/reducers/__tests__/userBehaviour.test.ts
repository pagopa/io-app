import { applicationChangeState } from "../../../../../store/actions/application";
import {
  resetNotificationBannerDismissState,
  setEngagementScreenShown,
  setPushNotificationBannerForceDismissed,
  setUserDismissedNotificationsBanner
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
  it(' "pushNotificationsBanner.timesDismissed" should be "1" after receiving "setUserDismissedNotificationsBanner"', () => {
    const userBehaviourState = userBehaviourReducer(
      undefined,
      setUserDismissedNotificationsBanner()
    );
    expect(userBehaviourState.pushNotificationsBanner.timesDismissed).toBe(1);
  });
  it(' "pushNotificationsBanner.forceDismissionDate" should be "Date" after receiving "setPushNotificationBannerForceDismissed"', () => {
    const userBehaviourState = userBehaviourReducer(
      undefined,
      setPushNotificationBannerForceDismissed()
    );

    expect(
      typeof userBehaviourState.pushNotificationsBanner.forceDismissionDate
    ).toBe("number");
  });
  it("pushNotificationsBanner should match initial state upon receiving 'resetNotificationBannerDismissState", () => {
    const userBehaviourState = userBehaviourReducer(
      undefined,
      resetNotificationBannerDismissState()
    );
    expect(userBehaviourState.pushNotificationsBanner).toEqual({
      timesDismissed: 0,
      forceDismissionDate: undefined
    });
  });
});
