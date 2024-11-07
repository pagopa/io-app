import { renderabilitySelectorsFromBannerMap } from "..";
import { BannerMapById } from "../landingScreenBannerMap";

describe("renderabilitySelectorsFromBannerMap", () => {
  it("should return a map of selectors, given  a dirty map", () => {
    const ITW_FN = () => null;
    const SETTINGS_FN = () => null;
    const bannerMap = {
      ITW_DISCOVERY: {
        isRenderableSelector: ITW_FN,
        foo: "bar",
        somethingElse: true
      },
      SETTINGS_DISCOVERY: {
        isRenderableSelector: SETTINGS_FN,
        bar: "baz",
        somethingElse: false
      }
    } as unknown as BannerMapById;

    const result = renderabilitySelectorsFromBannerMap(bannerMap);
    expect(result).toEqual({
      ITW_DISCOVERY: ITW_FN,
      SETTINGS_DISCOVERY: SETTINGS_FN
    });
  });
});
