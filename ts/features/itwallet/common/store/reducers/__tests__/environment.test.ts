import { applicationChangeState } from "../../../../../../store/actions/application";
import { itwResetEnv, itwSetEnv } from "../../actions/environment";
import reducer from "../environment";

describe("IT Wallet environment reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, applicationChangeState("active"))).toEqual({
      env: "prod"
    });
  });

  it("should handle itwSetEnv action", () => {
    const action = itwSetEnv("pre");
    const newState = reducer(undefined, action);
    expect(newState).toEqual({ env: "pre" });
  });

  it("should handle itwResetEnv action", () => {
    const action = itwResetEnv();
    const newState = reducer(undefined, action);
    expect(newState).toEqual({ env: "prod" });
  });
});
