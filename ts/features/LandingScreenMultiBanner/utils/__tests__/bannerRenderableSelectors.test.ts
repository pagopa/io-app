import { renderabilitySelectorsFromBannerMap } from "..";
import { BannerMapById } from "../landingScreenBannerMap";

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
