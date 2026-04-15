import _ from "lodash";
import { applicationChangeState } from "../../../../../../store/actions/application.ts";
import { appReducer } from "../../../../../../store/reducers/index.ts";
import {
  itwIsOfflineAccessLimitReached,
  itwOfflineAccessCounterSelector,
  itwShouldDisplayOfflineAccessLimitWarning
} from "../securePreferences.ts";

describe("itwOfflineAccessCounterSelector", () => {
  it("should return the offline access counter from secure preferences", () => {
    const globalState = appReducer(undefined, applicationChangeState("active"));
    const stateWithCounter = _.set(
      globalState,
      "features.itWallet.securePreferences",
      {
        offlineAccessCounter: 3
      }
    );
    expect(itwOfflineAccessCounterSelector(stateWithCounter)).toEqual(3);
  });
});

describe("itwIsOfflineAccessLimitReached", () => {
  test.each([
    [false, 0],
    [false, 4],
    [true, 5]
  ])(
    "should return %p when offline access counter is %p",
    (expected, counter) => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const stateWithCounter = _.set(
        globalState,
        "features.itWallet.securePreferences",
        {
          offlineAccessCounter: counter
        }
      );
      expect(itwIsOfflineAccessLimitReached(stateWithCounter)).toBe(expected);
    }
  );
});

describe("itwShouldDisplayOfflineAccessLimitWarning", () => {
  test.each([
    [false, 0],
    [true, 4],
    [false, 5]
  ])(
    "should return %p when offline access counter is %p",
    (expected, counter) => {
      const globalState = appReducer(
        undefined,
        applicationChangeState("active")
      );
      const stateWithCounter = _.set(
        // TODO: [SIW-2892] Revise this test accordingly
        _.set(globalState, "identification.progress", { kind: "identified" }),
        "features.itWallet.securePreferences",
        {
          offlineAccessCounter: counter
        }
      );
      expect(itwShouldDisplayOfflineAccessLimitWarning(stateWithCounter)).toBe(
        expected
      );
    }
  );
});
