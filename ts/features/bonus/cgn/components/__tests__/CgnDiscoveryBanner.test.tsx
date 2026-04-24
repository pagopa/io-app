import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import MockDate from "mockdate";
import { Store, createStore } from "redux";
import { InitializedProfile } from "../../../../../../definitions/backend/identity/InitializedProfile";
import { StatusEnum } from "../../../../../../definitions/cgn/CardActivated";
import { applicationChangeState } from "../../../../../store/actions/application";
import { backendStatusLoadSuccess } from "../../../../../store/actions/backendStatus";
import { appReducer } from "../../../../../store/reducers";
import { baseRawBackendStatus } from "../../../../../store/reducers/__mock__/backendStatus";
import { GlobalState } from "../../../../../store/reducers/types";
import * as appVersion from "../../../../../utils/appVersion";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { SERVICES_ROUTES } from "../../../../services/common/navigation/routes";
import { profileLoadSuccess } from "../../../../settings/common/store/actions";
import { loadAvailableBonuses } from "../../../common/store/actions/availableBonusesTypes";
import { cgnActivationStart } from "../../store/actions/activation";
import { closeCgnDiscoveryBanner } from "../../store/actions/banners";
import { cgnDetails } from "../../store/actions/details";
import { isCgnEngagementBannerRenderableSelector } from "../../store/selectors/banners";
import CgnDiscoveryBanner from "../CgnDiscoveryBanner";

const mockBannerConfig = {
  min_app_version: {
    android: "1.0.0.0",
    ios: "1.0.0.0"
  },
  description: {
    "it-IT": "Desc test",
    "en-EN": "Desc test"
  },
  title: {
    "it-IT": "Title",
    "en-EN": "Title"
  },
  action: {
    label: {
      "it-IT": "Action",
      "en-EN": "Action"
    },
    url: "https://example.com"
  }
};

// A young profile eligible for CGN (age <= 35)
const youngProfile = {
  fiscal_code: "RSSMRA00A01H501U",
  date_of_birth: new Date(2000, 0, 1).toISOString()
} as unknown as InitializedProfile;

// An old profile NOT eligible for CGN (age > 35)
const oldProfile = {
  fiscal_code: "RSSMRA60A01H501U",
  date_of_birth: new Date(1960, 0, 1).toISOString()
} as unknown as InitializedProfile;

const createTestStore = () => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  return createStore(appReducer, initialState as any) as Store<GlobalState>;
};

const mockHandleOnClose = jest.fn();

const renderComponent = (store: Store<GlobalState>) =>
  renderScreenWithNavigationStoreContext(
    () => <CgnDiscoveryBanner handleOnClose={mockHandleOnClose} />,
    SERVICES_ROUTES.SERVICES_HOME,
    {},
    store
  );

const setupStoreWithBannerEnabled = (
  store: Store<GlobalState>,
  profile: InitializedProfile = youngProfile
) => {
  store.dispatch(profileLoadSuccess(profile));
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
  // Simulate CGN details fetched but user NOT enrolled (cancel = no CGN)
  store.dispatch(cgnDetails.cancel());
};
describe("CgnDiscoveryBanner", () => {
  beforeEach(() => {
    jest.spyOn(appVersion, "getAppVersion").mockImplementation(() => "2.0.0.0");
    // set date to 2026 fixed
    MockDate.set("2026-01-01");
    mockHandleOnClose.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    MockDate.reset();
  });

  it("should not render when remote config is not loaded", () => {
    const store = createTestStore();
    store.dispatch(profileLoadSuccess(youngProfile));
    const component = renderComponent(store);
    expect(component.queryByTestId("cgnDiscoveryBannerTestID")).toBeNull();
  });

  it("should not render when user is not eligible for CGN (age > 35)", () => {
    const store = createTestStore();
    setupStoreWithBannerEnabled(store, oldProfile);
    expect(isCgnEngagementBannerRenderableSelector(store.getState())).toBe(
      false
    );
  });

  it("should not render when user is already enrolled in CGN", () => {
    const store = createTestStore();
    setupStoreWithBannerEnabled(store);
    store.dispatch(
      cgnDetails.success({
        status: StatusEnum.ACTIVATED,
        activation_date: new Date(),
        expiration_date: new Date(2030, 0, 1)
      })
    );
    expect(isCgnEngagementBannerRenderableSelector(store.getState())).toBe(
      false
    );
  });

  it("should not render when the banner has been closed", () => {
    const store = createTestStore();
    setupStoreWithBannerEnabled(store);
    store.dispatch(closeCgnDiscoveryBanner());
    expect(isCgnEngagementBannerRenderableSelector(store.getState())).toBe(
      false
    );
  });

  it("should not render when app version is lower than min_app_version", () => {
    jest.spyOn(appVersion, "getAppVersion").mockImplementation(() => "0.1.0.0");
    const store = createTestStore();
    setupStoreWithBannerEnabled(store);
    expect(isCgnEngagementBannerRenderableSelector(store.getState())).toBe(
      false
    );
  });

  it("should render when all conditions are met", () => {
    const store = createTestStore();
    setupStoreWithBannerEnabled(store);
    const component = renderComponent(store);
    expect(component.queryByTestId("cgnDiscoveryBannerTestID")).not.toBeNull();
  });

  it("should dispatch closeCgnDiscoveryBanner on close", () => {
    const store = createTestStore();
    setupStoreWithBannerEnabled(store);
    const spy = jest.spyOn(store, "dispatch");
    const component = renderComponent(store);
    const closeButton = component.getByRole("button", { name: /chiudi/i });
    fireEvent.press(closeButton);
    expect(spy).toHaveBeenCalledWith(closeCgnDiscoveryBanner());
  });

  it("should dispatch activation actions on CTA press", () => {
    const store = createTestStore();
    setupStoreWithBannerEnabled(store);
    const spy = jest.spyOn(store, "dispatch");
    const component = renderComponent(store);
    const ctaButton = component.getByText("Action");
    fireEvent.press(ctaButton);
    expect(spy).toHaveBeenCalledWith(loadAvailableBonuses.request());
    expect(spy).toHaveBeenCalledWith(cgnActivationStart());
  });

  it("should dispatch cgnDetails.request when CGN details have not been fetched yet", () => {
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
    // Do NOT dispatch cgnDetails.cancel() — so cgnFetched=false and cgnStatus=pot.none
    const spy = jest.spyOn(store, "dispatch");
    renderComponent(store);
    expect(spy).toHaveBeenCalledWith(cgnDetails.request());
  });

  it("should not dispatch cgnDetails.request when CGN details have already been fetched", () => {
    const store = createTestStore();
    setupStoreWithBannerEnabled(store);
    const spy = jest.spyOn(store, "dispatch");
    renderComponent(store);
    expect(spy).not.toHaveBeenCalledWith(cgnDetails.request());
  });

  it("should use i18n fallback CTA when action label is not provided", () => {
    const store = createTestStore();
    const bannerConfigWithoutAction = {
      min_app_version: mockBannerConfig.min_app_version,
      description: mockBannerConfig.description,
      title: mockBannerConfig.title
      // no action field
    };
    store.dispatch(profileLoadSuccess(youngProfile));
    store.dispatch(
      backendStatusLoadSuccess({
        ...baseRawBackendStatus,
        config: {
          ...baseRawBackendStatus.config,
          cgn: {
            ...baseRawBackendStatus.config.cgn,
            show_cgn_engagement_banner: bannerConfigWithoutAction
          }
        }
      })
    );
    store.dispatch(cgnDetails.cancel());
    const component = renderComponent(store);
    expect(component.queryByTestId("cgnDiscoveryBannerTestID")).not.toBeNull();
    expect(
      component.getByText(I18n.t("bonus.cgn.engagement.banner.cta"))
    ).toBeTruthy();
  });
});
