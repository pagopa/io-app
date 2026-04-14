import { applicationChangeState } from "../../../../../../store/actions/application";
import {
  itwSetSpecsVersion,
  itwResetEnv,
  itwSetEnv
} from "../../actions/environment";
import reducer from "../environment";

describe("IT Wallet environment reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, applicationChangeState("active"))).toEqual({
      env: "prod",
      itWalletSpecsVersion: "1.0.0"
    });
  });

  it("should handle itwSetEnv action", () => {
    const action = itwSetEnv("pre");
    const newState = reducer(undefined, action);
    expect(newState).toEqual({ env: "pre", itWalletSpecsVersion: "1.0.0" });
  });

  it("should handle itwResetEnv action", () => {
    const action = itwResetEnv();
    const newState = reducer(undefined, action);
    expect(newState).toEqual({ env: "prod", itWalletSpecsVersion: "1.0.0" });
  });

  it("should handle itwSetSpecsVersion action", () => {
    const action = itwSetSpecsVersion("1.3.3");
    const newState = reducer(undefined, action);
    expect(newState).toEqual({ env: "prod", itWalletSpecsVersion: "1.3.3" });
  });
});
