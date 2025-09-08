import { setAarFlowState, terminateAarFlow } from "..";
import { AARFlowState, sendAARFlowStates } from "../../reducers";

describe("AARFlowStateActions", () => {
  const payload: AARFlowState = {
    type: sendAARFlowStates.displayingAARToS,
    qrCode: "https://www.google.com"
  };
  it(`Should have correct type="SET_AAR_FLOW_STATE" and payload: ${JSON.stringify(
    payload
  )}`, () => {
    const action = setAarFlowState(payload);
    expect(action.type).toBe("SET_AAR_FLOW_STATE");
    expect(action.payload).toEqual(payload);
  });

  it(`Should have correct type="TERMINATE_AAR_FLOW"`, () => {
    const action = terminateAarFlow();
    expect(action.type).toBe("TERMINATE_AAR_FLOW");
  });
});
