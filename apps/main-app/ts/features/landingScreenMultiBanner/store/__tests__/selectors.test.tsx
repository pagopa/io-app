import * as Reselect from "reselect";
import { GlobalState } from "../../../../store/reducers/types";
import { LandingScreenBannerState } from "../reducer";
import * as SELECTORS from "../selectors";

// eslint-disable-next-line functional/immutable-data
process.env.NODE_ENV = "test";

const mockState = {
  features: {
    landingBanners: {
      ITW_DISCOVERY: true
    }
  }
} as GlobalState;

const testLandingMap = {
  item1: {
    isRenderableSelector: () => true
  },

  item2: {
    isRenderableSelector: () => false
  }
};
jest.mock("../../utils/landingScreenBannerMap", () => ({
  get landingScreenBannerMap() {
    return testLandingMap;
  }
}));

describe("unifiedRenderabilitySelectors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  type UnifiedRenderabilityRes = { [key: string]: boolean };
  type UnifiedRenderability = ReturnType<
    typeof Reselect.createStructuredSelector<
      GlobalState,
      UnifiedRenderabilityRes
    >
  >;

  type TestImportType = typeof SELECTORS & {
    unifiedRenderability: UnifiedRenderability;
  };

  it("should correctly be exported when env='test'", () => {
    const unifiedRenderabilitySelectors = (SELECTORS as TestImportType)
      .unifiedRenderability;
    expect(unifiedRenderabilitySelectors).toBeDefined();
  });
  it("should correctly use the landingScreenBannerMap to evaluate to a [bannerMapKey]:boolean result", () => {
    const unifiedRenderabilitySelectors = (SELECTORS as TestImportType)
      .unifiedRenderability;
    expect(
      unifiedRenderabilitySelectors(undefined as unknown as GlobalState)
    ).toEqual({
      item1: true,
      item2: false
    });
  });
});

describe("landingScreenBannerToRenderSelector", () => {
  const testCases = [
    {
      // selector should correctly match the three selector's values
      title: " with a single one enabled, it should be returned",
      expected: "correct_id",
      backendStatus: ["correct_id"],
      reduxVisibility: {
        correct_id: true
      },
      bannerMapVisibility: {
        correct_id: true
      }
    },
    {
      // backendStatus should behave as "master" for the banner order
      title: " with multiple banners enabled, the first one should be returned",
      expected: "correct_id",
      backendStatus: ["correct_id", "another_id"],
      reduxVisibility: {
        correct_id: true,
        another_id: true
      },
      bannerMapVisibility: {
        correct_id: true,
        another_id: true
      }
    },
    {
      // while keeping its "master" role, backendStatus' return value should be filtered with local values
      title:
        " non locally enabled banners should be ignored from backendStatus ",
      expected: "correct_id",
      backendStatus: ["wrong_id", "correct_id"],
      reduxVisibility: {
        wrong_id: false,
        correct_id: true
      },
      bannerMapVisibility: {
        wrong_id: false,
        correct_id: true
      }
    },
    {
      title:
        " non locally defined banners should be ignored from backendStatus ",
      expected: "correct_id",
      backendStatus: ["wrong_id", "correct_id"],
      reduxVisibility: {
        correct_id: true
      },
      bannerMapVisibility: {
        correct_id: true
      }
    },
    {
      title: " a disabled redux visibility should filter out the banner ",
      expected: "another_id",
      backendStatus: ["correct_id", "another_id"],
      reduxVisibility: {
        correct_id: false,
        another_id: true
      },
      bannerMapVisibility: {
        correct_id: true,
        another_id: true
      }
    },
    {
      title:
        " a false return on the banner's specific selector should filter out the banner ",
      expected: "another_id",
      backendStatus: ["wrong_id", "correct_id", "another_id"],
      reduxVisibility: {
        correct_id: true,
        another_id: true
      },
      bannerMapVisibility: {
        correct_id: false,
        another_id: true
      }
    },
    {
      title:
        " in case of no enabled banner, undefined should be returned (both false) ",
      expected: undefined,
      backendStatus: [
        "wrong_id",
        "correct_id",
        "another_id",
        "some",
        "more",
        "ids"
      ],
      reduxVisibility: {
        correct_id: false
      },
      bannerMapVisibility: {
        correct_id: false
      }
    },
    {
      // same should happen in case of a mismatch
      title:
        " in case of no enabled banner, undefined should be returned (1F 1T) ",
      expected: undefined,
      backendStatus: [
        "wrong_id",
        "correct_id",
        "another_id",
        "some",
        "more",
        "ids"
      ],
      reduxVisibility: {
        correct_id: true
      },
      bannerMapVisibility: {
        correct_id: false
      }
    },
    {
      title:
        " in case of no enabled banner, undefined should be returned (undefined on bannerMap)",
      expected: undefined,
      backendStatus: [
        "wrong_id",
        "correct_id",
        "another_id",
        "some",
        "more",
        "ids"
      ],
      reduxVisibility: {
        correct_id: true
      },
      bannerMapVisibility: {}
    },
    {
      title:
        " in case of no enabled banner, undefined should be returned (undefined on reduxVis)",
      expected: undefined,
      backendStatus: [
        "wrong_id",
        "correct_id",
        "another_id",
        "some",
        "more",
        "ids"
      ],
      reduxVisibility: {},
      bannerMapVisibility: {
        correct_id: true
      }
    },

    {
      title:
        " in case of no enabled banner, undefined should be returned (undefined on backendStatus)",
      expected: undefined,
      backendStatus: [],
      reduxVisibility: {
        correct_id: true
      },
      bannerMapVisibility: {
        correct_id: true
      }
    }
  ];

  testCases.forEach(item => {
    it(item.title, () => {
      const resultFunc =
        SELECTORS.landingScreenBannerToRenderSelector.resultFunc;
      const result = resultFunc(
        item.backendStatus,
        item.reduxVisibility as LandingScreenBannerState,
        item.bannerMapVisibility as LandingScreenBannerState
      );
      expect(result).toEqual(item.expected);
    });
  });
});

describe("localBannerVisiblitySelector", () => {
  it("should return the local visibility", () => {
    const result = SELECTORS.localBannerVisibilitySelector(mockState);
    expect(result).toEqual(mockState.features.landingBanners);
  });
});
