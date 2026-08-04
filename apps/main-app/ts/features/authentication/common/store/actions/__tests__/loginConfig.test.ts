import { OneIdentityEnv } from "../../reducers/loginConfig";
import {
  setOneIdentityEnv,
  setOneIdentityLocalFeatureFlag
} from "../loginConfig";

describe("setOneIdentityLocalFeatureFlag", () => {
  it.each([true, false, undefined])(
    "should match expected values with %s",
    value => {
      const action = setOneIdentityLocalFeatureFlag(value);
      expect(action.type).toBe("SET_ONE_IDENTITY_LOCAL_FEATURE_FLAG");
      expect(action.payload).toBe(value);
    }
  );
});

describe("setOneIdentityEnv", () => {
  it.each(["prod", "uat"] as ReadonlyArray<OneIdentityEnv>)(
    "should match expected values with %s",
    value => {
      const action = setOneIdentityEnv(value);
      expect(action.type).toBe("SET_ONE_IDENTITY_ENV");
      expect(action.payload).toBe(value);
    }
  );
});
