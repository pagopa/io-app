import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { identity } from "lodash";
import { GlobalState } from "../../types";
import { landingScreenBannerOrderSelector } from "../remoteConfig";

describe("landingScreenBannerOrderSelector", () => {
  const getMock = (priority_order: any) =>
    ({
      remoteConfig: O.some({
        landing_banners: {
          priority_order
        }
      })
    } as GlobalState);

  const some_priorityOrder = ["id1", "id2", "id3"];
  const customNoneStore = {
    remoteConfig: O.none
  } as GlobalState;
  const undefinedLandingBannersStore = {
    remoteConfig: O.some({})
  } as GlobalState;
  const testCases = [
    {
      selectorInput: getMock(some_priorityOrder),
      expected: some_priorityOrder
    },
    {
      selectorInput: getMock(undefined),
      expected: []
    },
    {
      selectorInput: getMock([]),
      expected: []
    },
    {
      selectorInput: customNoneStore,
      expected: []
    },
    {
      selectorInput: undefinedLandingBannersStore,
      expected: []
    }
  ];

  for (const testCase of testCases) {
    it(`should return [${testCase.expected}] for ${JSON.stringify(
      pipe(
        testCase.selectorInput.remoteConfig,
        O.fold(
          // eslint-disable-next-line no-underscore-dangle
          () => testCase.selectorInput.remoteConfig._tag,
          identity
        )
      )
    )}`, () => {
      const output = landingScreenBannerOrderSelector(testCase.selectorInput);
      expect(output).toStrictEqual(testCase.expected);
    });
  }
});
