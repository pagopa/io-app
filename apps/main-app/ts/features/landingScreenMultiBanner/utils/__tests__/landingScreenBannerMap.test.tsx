import { landingScreenBannerMap } from "../landingScreenBannerMap";

const mockCloseHandler = jest.fn();

describe("landingScreenBannerMap", () => {
  it.each(Object.keys(landingScreenBannerMap))(
    "should return a valid element for %s",
    bannerId => {
      const entry =
        landingScreenBannerMap[bannerId as keyof typeof landingScreenBannerMap];
      const element = entry.component(mockCloseHandler);
      expect(element).toBeDefined();
    }
  );
});
