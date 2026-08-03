import * as O from "fp-ts/lib/Option";

import { OneIdentityConfig } from "../../../../../../../definitions/content/OneIdentityConfig";
import { GlobalState } from "../../../../../../store/reducers/types";
import { oneIdentityRemoteConfigSelector } from "../remoteConfig";

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
