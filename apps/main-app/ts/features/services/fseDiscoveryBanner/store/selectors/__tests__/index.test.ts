import * as O from "fp-ts/lib/Option";
import { GlobalState } from "../../../../../../store/reducers/types";
import { testable, isFseDiscoveryBannerRenderableSelector } from "..";

const { isFseDiscoveryBannerDismissedSelector } = testable!;
describe("fseDiscoveryBanner selectors", () => {
  const webUrl = "https://example.com/fse";

  it("should return the dismissed state", () => {
    const state = mockState({ isDismissed: true });

    expect(isFseDiscoveryBannerDismissedSelector(state)).toBe(true);
  });

  it("should render the FSE banner when it has not been dismissed and has a web url", () => {
    const state = mockState({ isDismissed: false, webUrl });

    expect(isFseDiscoveryBannerRenderableSelector(state)).toBe(true);
  });

  it("should not render the FSE banner when it has been dismissed", () => {
    const state = mockState({ isDismissed: true, webUrl });

    expect(isFseDiscoveryBannerRenderableSelector(state)).toBe(false);
  });

  it("should not render the FSE banner when the web url is missing", () => {
    const state = mockState({ isDismissed: false, webUrl: undefined });

    expect(isFseDiscoveryBannerRenderableSelector(state)).toBe(false);
  });
});

const mockState = (params: { isDismissed?: boolean; webUrl?: string }) => {
  const { isDismissed = false } = params;
  const webUrl = "webUrl" in params ? params.webUrl : "https://example.com/fse";

  return {
    remoteConfig: O.some({
      fse: {
        landingBanner: {
          ...(webUrl !== undefined ? { engagement_url: webUrl } : {})
        }
      }
    }),
    features: {
      services: {
        fseDiscoveryBanner: {
          isDismissed
        }
      }
    }
  } as unknown as GlobalState;
};
