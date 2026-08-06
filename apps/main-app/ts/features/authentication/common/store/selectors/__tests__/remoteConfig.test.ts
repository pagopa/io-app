import * as O from "fp-ts/lib/Option";

import { OneIdentityConfig } from "../../../../../../../definitions/content/OneIdentityConfig";
import { GlobalState } from "../../../../../../store/reducers/types";
import { oneIdentityRolloutPercentageSelector } from "../remoteConfig";

const makeState = (oneIdentity?: OneIdentityConfig): GlobalState =>
  ({
    remoteConfig: oneIdentity === undefined ? O.none : O.some({ oneIdentity })
  }) as GlobalState;

describe("oneIdentityRolloutPercentageSelector", () => {
  it("should return 0 when remoteConfig is none", () => {
    expect(oneIdentityRolloutPercentageSelector(makeState())).toBe(0);
  });

  it("should return 0 when rolloutPercentage is absent", () => {
    expect(oneIdentityRolloutPercentageSelector(makeState({}))).toBe(0);
  });

  it("should return the remote rolloutPercentage when present", () => {
    expect(
      oneIdentityRolloutPercentageSelector(makeState({ rolloutPercentage: 75 }))
    ).toBe(75);
  });
});
