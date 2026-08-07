import { mapValues } from "lodash";

import { BannerMapById } from "./landingScreenBannerMap";

/**
 * Extracts renderability selectors from component map, and indexes them by ID
 * ----
 *
 * @param bannerMap A `{[bannerID]:{ isRenderableSelector: Selector, foo:bar }
 *   }` map
 * @returns A `{[bannerID]: isRenderableSelector }` map
 */
export const renderabilitySelectorsFromBannerMap = (bannerMap: BannerMapById) =>
  mapValues(bannerMap, ({ isRenderableSelector }) => isRenderableSelector);
