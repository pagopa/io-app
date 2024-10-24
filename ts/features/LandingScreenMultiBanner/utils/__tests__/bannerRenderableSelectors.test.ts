import { isItwEnabledSelector } from "../../../../store/reducers/backendStatus";
import { GlobalState } from "../../../../store/reducers/types";
import { itwLifecycleIsValidSelector } from "../../../itwallet/lifecycle/store/selectors";
import { isItwTrialActiveSelector } from "../../../trialSystem/store/reducers";
import {
  isItwDiscoveryBannerRenderableSelector,
  renderabilitySelectorsFromBannerMap
} from "../bannerRenderableSelectors";
import { BannerMapById } from "../landingScreenBannerMap";

jest.mock("../../../../store/reducers/backendStatus", () => ({
  isItwEnabledSelector: jest.fn()
}));
jest.mock("../../../itwallet/lifecycle/store/selectors", () => ({
  itwLifecycleIsValidSelector: jest.fn()
}));
jest.mock("../../../trialSystem/store/reducers", () => ({
  isItwTrialActiveSelector: jest.fn()
}));
beforeEach(() => {
  jest.resetAllMocks();
  jest.clearAllMocks();
});

type JestMock = ReturnType<typeof jest.fn>;
const mockValues = (
  itwEnabledMock: boolean,
  itwLifecycleValidMock: boolean,
  trialActiveMock: boolean
) => {
  (isItwEnabledSelector as unknown as JestMock).mockReturnValue(itwEnabledMock);
  (itwLifecycleIsValidSelector as unknown as JestMock).mockReturnValue(
    itwLifecycleValidMock
  );
  (isItwTrialActiveSelector as unknown as JestMock).mockReturnValue(
    trialActiveMock
  );
};

describe("itwDiscoveryBannerSelector", () => {
  for (const itwEnabled of [true, false]) {
    for (const lifecycleValid of [true, false]) {
      for (const trialActive of [true, false]) {
        const expectedResult = !(!trialActive || lifecycleValid || !itwEnabled); // this mimicks the behaviour of the standalone banner's selector
        it(`should return ${expectedResult} if isItwEnabled is ${itwEnabled}, trialActive is ${trialActive} and lifecycleValid is ${lifecycleValid}`, () => {
          mockValues(itwEnabled, lifecycleValid, trialActive);
          expect(
            isItwDiscoveryBannerRenderableSelector({} as unknown as GlobalState)
          ).toBe(expectedResult);
        });
      }
    }
  }
});

describe("renderabilitySelectorsFromBannerMap", () => {
  it("should return a map of selectors, given  a dirty map", () => {
    const bannerMap = {
      ITW_DISCOVERY: {
        isRenderableSelector: expect.any(Function),
        foo: "bar",
        somethingElse: true
      },
      SETTINGS_DISCOVERY: {
        isRenderableSelector: expect.any(Function),
        bar: "baz",
        somethingElse: false
      }
    } as unknown as BannerMapById;

    const result = renderabilitySelectorsFromBannerMap(bannerMap);
    expect(result).toEqual(
      expect.objectContaining({
        ITW_DISCOVERY: expect.any(Function),
        SETTINGS_DISCOVERY: expect.any(Function)
      })
    );
  });

  it("should not break if wrong data has been passed", () => {
    const bannerMap = {
      ITW_DISCOVERY: { wrongKey: expect.any(Number) }
    } as unknown as BannerMapById;

    expect(renderabilitySelectorsFromBannerMap(bannerMap)).toBeDefined();
  });
});
