import { GlobalState } from "../../../../../../store/reducers/types";
import { selectItwEnv } from "../environment";

describe("selectItwEnv", () => {
  it("should return the correct environment", () => {
    const state = {
      features: {
        itWallet: {
          environment: {
            env: "pre"
          }
        }
      }
    } as GlobalState;

    expect(selectItwEnv(state)).toEqual("pre");
  });

  it("should return the default environment if not set", () => {
    const state = {
      features: {
        itWallet: {
          environment: {
            env: undefined
          }
        }
      }
    } as GlobalState;

    expect(selectItwEnv(state)).toEqual("prod");
  });
});
