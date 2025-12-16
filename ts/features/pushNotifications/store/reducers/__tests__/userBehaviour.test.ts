import { applicationChangeState } from "../../../../../store/actions/application";
import {
  resetNotificationBannerDismissState,
  setPushNotificationBannerForceDismissed,
  setUserDismissedNotificationsBanner
} from "../../actions/userBehaviour";
import { userBehaviourReducer, UserBehaviourState } from "../userBehaviour";

describe("userBehaviourReducer", () => {
  it("Should match snapshot", () => {
    const userBehaviourState = userBehaviourReducer(
      undefined,
      applicationChangeState("active")
    );
    expect(userBehaviourState).toMatchSnapshot();
  });
  it(' "pushNotificationsBanner.timesDismissed" should be "1" after receiving "setUserDismissedNotificationsBanner"', () => {
    const userBehaviourState = userBehaviourReducer(
      undefined,
      setUserDismissedNotificationsBanner()
    );
    expect(userBehaviourState.pushNotificationBannerDismissalCount).toBe(1);
  });
  it(' "pushNotificationsBanner.forceDismissionDate" should be "Date" after receiving "setPushNotificationBannerForceDismissed"', () => {
    const userBehaviourState = userBehaviourReducer(
      undefined,
      setPushNotificationBannerForceDismissed()
    );

    expect(
      typeof userBehaviourState.pushNotificationBannerForceDismissionDate
    ).toBe("number");
  });
  it("pushNotificationsBanner should match initial state upon receiving 'resetNotificationBannerDismissState", () => {
    const userBehaviourState = userBehaviourReducer(
      undefined,
      resetNotificationBannerDismissState()
    );
    expect(userBehaviourState).toEqual({
      pushNotificationBannerDismissalCount: 0,
      pushNotificationBannerForceDismissionDate: undefined
    } as UserBehaviourState);
  });
});
