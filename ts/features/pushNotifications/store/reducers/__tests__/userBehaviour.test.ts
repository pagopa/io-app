import { applicationChangeState } from "../../../../../store/actions/application";
import { setEngagementScreenShown } from "../../actions/userBehaviour";
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
});
