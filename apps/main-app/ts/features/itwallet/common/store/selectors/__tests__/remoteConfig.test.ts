import { GlobalState } from "../../../../../../store/reducers/types";
import * as appVersion from "../../../../../../utils/appVersion";
import {
  isItwEnabledSelector,
  isItwFeedbackBannerEnabledSelector,
  isItwMinAppVersionSupportedSelector,
  isItwProximityMinAppVersionSupportedSelector,
  itwDisabledCredentialsSelector,
  itwDisabledIdentificationMethodsSelector,
  itwHiddenCredentialsSelector,
  itwIPatenteCtaConfigSelector,
  itwIpzsPrivacyUrlSelector,
  itwIsActivationDisabledSelector,
  itwIsIPatenteCtaEnabledSelector,
  itwNewCredentialsSelector,
  itwPinnedCredentialsSelector
} from "../remoteConfig";

const makeState = (remoteConfig: object): GlobalState =>
  ({ features: { itWallet: { remoteConfig } } }) as GlobalState;

const minAppVersion = (version: string) => ({
  ios: version,
  android: version
});

describe("isItwEnabledSelector", () => {
  afterEach(() => jest.restoreAllMocks());

  it.each`
    name                         | remoteConfig                                                     | currentVersion | expected
    ${"empty config"}            | ${{}}                                                            | ${"2.0.0.0"}   | ${false}
    ${"disabled config"}         | ${{ enabled: false, min_app_version: minAppVersion("1.0.0.0") }} | ${"2.0.0.0"}   | ${false}
    ${"missing min app version"} | ${{ enabled: true }}                                             | ${"2.0.0.0"}   | ${false}
    ${"unsupported app version"} | ${{ enabled: true, min_app_version: minAppVersion("3.0.0.0") }}  | ${"2.0.0.0"}   | ${false}
    ${"equal app version"}       | ${{ enabled: true, min_app_version: minAppVersion("2.0.0.0") }}  | ${"2.0.0.0"}   | ${true}
    ${"newer app version"}       | ${{ enabled: true, min_app_version: minAppVersion("1.0.0.0") }}  | ${"2.0.0.0"}   | ${true}
  `(
    "returns $expected for $name",
    ({ remoteConfig, currentVersion, expected }) => {
      jest.spyOn(appVersion, "getAppVersion").mockReturnValue(currentVersion);

      expect(isItwEnabledSelector(makeState(remoteConfig))).toBe(expected);
    }
  );
});

describe.each([
  ["IT-Wallet L3", "itw_l3", isItwMinAppVersionSupportedSelector] as const,
  [
    "proximity",
    "proximity",
    isItwProximityMinAppVersionSupportedSelector
  ] as const
])("%s min app version selector", (_, configKey, selector) => {
  afterEach(() => jest.restoreAllMocks());

  it("returns false without min app version", () => {
    expect(selector(makeState({}))).toBe(false);
  });

  it.each`
    currentVersion | requiredVersion | expected
    ${"1.0.0.0"}   | ${"2.0.0.0"}    | ${false}
    ${"2.0.0.0"}   | ${"2.0.0.0"}    | ${true}
    ${"3.0.0.0"}   | ${"2.0.0.0"}    | ${true}
  `(
    "returns $expected for app $currentVersion and minimum $requiredVersion",
    ({ currentVersion, requiredVersion, expected }) => {
      jest.spyOn(appVersion, "getAppVersion").mockReturnValue(currentVersion);

      expect(
        selector(
          makeState({
            [configKey]: { min_app_version: minAppVersion(requiredVersion) }
          })
        )
      ).toBe(expected);
    }
  );
});

describe.each([
  [
    "feedback banner",
    isItwFeedbackBannerEnabledSelector,
    { feedback_banner_visible: true }
  ] as const,
  [
    "wallet activation disabled",
    itwIsActivationDisabledSelector,
    { wallet_activation_disabled: true }
  ] as const,
  [
    "iPatente CTA",
    itwIsIPatenteCtaEnabledSelector,
    { ipatente_cta_visible: true }
  ] as const
])("%s selector", (_, selector, enabledConfig) => {
  it("returns false when config is missing", () => {
    expect(selector(makeState({}))).toBe(false);
  });

  it("returns configured value", () => {
    expect(selector(makeState(enabledConfig))).toBe(true);
  });
});

describe.each([
  [
    "disabled identification methods",
    itwDisabledIdentificationMethodsSelector,
    { disabled_identification_methods: ["cie", "spid"] },
    ["cie", "spid"]
  ] as const,
  [
    "disabled credentials",
    itwDisabledCredentialsSelector,
    { disabled_credentials: ["mDL", "dc"] },
    ["mDL", "dc"]
  ] as const,
  [
    "pinned credentials",
    itwPinnedCredentialsSelector,
    { pinned_credentials: ["mDL", "dc"] },
    ["mDL", "dc"]
  ] as const,
  [
    "new credentials",
    itwNewCredentialsSelector,
    { new_credentials: ["mDL", "dc"] },
    ["mDL", "dc"]
  ] as const,
  [
    "hidden credentials",
    itwHiddenCredentialsSelector,
    { hidden_credentials: ["mDL", "dc"] },
    ["mDL", "dc"]
  ] as const
])("%s selector", (_, selector, configuredState, expected) => {
  it("returns an empty array when config is missing", () => {
    expect(selector(makeState({}))).toEqual([]);
  });

  it("returns configured values", () => {
    expect(selector(makeState(configuredState))).toEqual(expected);
  });
});

describe("itwIPatenteCtaConfigSelector", () => {
  it("returns undefined when config is missing", () => {
    expect(itwIPatenteCtaConfigSelector(makeState({}))).toBeUndefined();
  });

  it("returns configured value", () => {
    const config = {
      visibility: true,
      url: "https://example.com",
      service_id: "service-id"
    };

    expect(
      itwIPatenteCtaConfigSelector(makeState({ ipatente_cta_config: config }))
    ).toEqual(config);
  });
});

describe("itwIpzsPrivacyUrlSelector", () => {
  it("returns undefined when config is missing", () => {
    expect(itwIpzsPrivacyUrlSelector(makeState({}))).toBeUndefined();
  });

  it("returns configured value", () => {
    const url = "https://example.com/privacy";

    expect(
      itwIpzsPrivacyUrlSelector(makeState({ ipzs_privacy_url: url }))
    ).toBe(url);
  });
});
