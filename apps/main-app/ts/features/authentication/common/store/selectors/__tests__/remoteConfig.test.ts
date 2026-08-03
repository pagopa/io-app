import * as O from "fp-ts/lib/Option";

import { OneIdentityConfig } from "../../../../../../../definitions/content/OneIdentityConfig";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  oneIdentityRemoteConfigSelector,
  oneIdentityRolloutPercentageSelector
} from "../remoteConfig";

const makeState = (oneIdentity?: OneIdentityConfig): GlobalState =>
  ({
    remoteConfig: oneIdentity === undefined ? O.none : O.some({ oneIdentity })
  }) as GlobalState;

describe("oneIdentityRemoteConfigSelector", () => {
  it("returns undefined when remoteConfig is none", () => {
    expect(oneIdentityRemoteConfigSelector(makeState())).toBeUndefined();
  });

  it("returns the remote oneIdentity sub-configuration when present", () => {
    const oneIdentity = { rolloutPercentage: 42 };
    expect(oneIdentityRemoteConfigSelector(makeState(oneIdentity))).toEqual(
      oneIdentity
    );
  });
});

describe("oneIdentityRolloutPercentageSelector", () => {
  it("returns 0 when remoteConfig is none", () => {
    expect(oneIdentityRolloutPercentageSelector(makeState())).toBe(0);
  });

  it("returns 0 when rolloutPercentage is absent", () => {
    expect(oneIdentityRolloutPercentageSelector(makeState({}))).toBe(0);
  });

  it("returns the remote rolloutPercentage when present", () => {
    expect(
      oneIdentityRolloutPercentageSelector(makeState({ rolloutPercentage: 75 }))
    ).toBe(75);
  });
});
