import { mapValues } from "lodash";
import { BannerMapById } from "./landingScreenBannerMap";

/**
 * extracts renderability selectors from component map,
 * and indexes them by ID
 * ----
 * @param bannerMap
 * a `{[bannerID]:{ isRenderableSelector: Selector, foo:bar } }` map
 * @returns
 * a `{[bannerID]: isRenderableSelector }` map
 */
export const renderabilitySelectorsFromBannerMap = (bannerMap: BannerMapById) =>
  mapValues(bannerMap, ({ isRenderableSelector }) => isRenderableSelector);
