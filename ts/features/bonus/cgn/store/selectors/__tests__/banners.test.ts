import MockDate from "mockdate";
import { createStore, Store } from "redux";
import { InitializedProfile } from "../../../../../../../definitions/backend/InitializedProfile";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { profileLoadSuccess } from "../../../../../settings/common/store/actions";
import {
  isCgnEligibleByAgeSelector,
  isCgnEngagementBannerRenderableSelector
} from "../banners";
import { cgnDetails } from "../../actions/details";
import { backendStatusLoadSuccess } from "../../../../../../store/actions/backendStatus";
import { baseRawBackendStatus } from "../../../../../../store/reducers/__mock__/backendStatus";

const youngProfile = {
  fiscal_code: "RSSMRA00A01H501U",
  date_of_birth: new Date(2000, 0, 1).toISOString()
} as unknown as InitializedProfile;

const oldProfile = {
  fiscal_code: "RSSMRA60A01H501U",
  date_of_birth: new Date(1960, 0, 1).toISOString()
} as unknown as InitializedProfile;

const createTestStore = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  return createStore(appReducer, initialState as any) as Store<GlobalState>;
};

describe("isCgnEligibleByAgeSelector", () => {
  beforeEach(() => {
    MockDate.set("2026-01-01");
  });
  it("should return false if profile is not defined", () => {
    const store = createTestStore();
    expect(isCgnEligibleByAgeSelector(store.getState())).toBe(false);
  });

  it("should return true if user is eligible for CGN (age <= 35)", () => {
    const store = createTestStore();
    store.dispatch(profileLoadSuccess(youngProfile));
    expect(isCgnEligibleByAgeSelector(store.getState())).toBe(true);
  });

  it("should return false if user is not eligible for CGN (age > 35)", () => {
    const store = createTestStore();
    store.dispatch(profileLoadSuccess(oldProfile));
    expect(isCgnEligibleByAgeSelector(store.getState())).toBe(false);
  });
});

const mockBannerConfig = {
  min_app_version: {
    android: "1.0.0",
    ios: "1.0.0"
  },
  description: {
    "it-IT": "Desc test",
    "en-EN": "Desc test"
  }
};

describe("isCgnEngagementBannerRenderableSelector", () => {
  beforeEach(() => {
    MockDate.set("2026-01-01");
  });
  it("should return false if profile is not defined", () => {
    const store = createTestStore();
    expect(isCgnEngagementBannerRenderableSelector(store.getState())).toBe(
      false
    );
  });

  it("should return true if user is eligible for CGN (age <= 35) and banner enabled", () => {
    const store = createTestStore();
    store.dispatch(profileLoadSuccess(youngProfile));
    store.dispatch(
      backendStatusLoadSuccess({
        ...baseRawBackendStatus,
        config: {
          ...baseRawBackendStatus.config,
          cgn: {
            ...baseRawBackendStatus.config.cgn,
            show_cgn_engagement_banner: mockBannerConfig
          }
        }
      })
    );
    store.dispatch(cgnDetails.cancel());
    expect(isCgnEngagementBannerRenderableSelector(store.getState())).toBe(
      true
    );
  });

  it("should return false if user is not eligible for CGN (age > 35)", () => {
    const store = createTestStore();
    store.dispatch(profileLoadSuccess(oldProfile));
    expect(isCgnEngagementBannerRenderableSelector(store.getState())).toBe(
      false
    );
  });
});
