import {
  isItwDiscoveryBannerRenderableSelector,
  isItwProximityEnabledSelector,
  itwOfflineAccessAvailableSelector,
  itwShouldRenderDiscoveryBannerSelector,
  itwShouldRenderInboxDiscoveryBannerSelector,
  itwShouldRenderL2EngagementBannerForInactiveWalletSelector,
  itwShouldRenderL2EngagementBannerSelector,
  itwShouldRenderL3UpgradeBannerSelector,
  itwShouldRenderNewItWalletSelector,
  itwShouldRenderUpgradeBannerSelector,
  itwShouldRenderWalletDiscoveryBannerSelector,
  itwShouldRenderWalletReadyBannerSelector,
  itwShouldRenderWalletUpgradeMDLDetailsBannerSelector
} from "..";
import { applicationChangeState } from "../../../../../../store/actions/application";
import { Action } from "../../../../../../store/actions/types";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { reproduceSequence } from "../../../../../../utils/tests";
import { setConnectionStatus } from "../../../../../connectivity/store/actions";
import { setOfflineAccessReason } from "../../../../../ingress/store/actions";
import { OfflineAccessReasonEnum } from "../../../../../ingress/store/reducer";
import * as credentialsSelectors from "../../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import { ItwLifecycleState } from "../../../../lifecycle/store/selectors";
import * as proximityCredentialsSelectors from "../../../../presentation/proximity/store/selectors/credentials";
import { itwSetWalletInstanceRemotelyActive } from "../../../../walletInstance/store/actions";
import * as walletInstanceSelectors from "../../../../walletInstance/store/selectors";
import { itwCloseBanner } from "../../actions/banners";
import * as remoteConfigSelectors from "../remoteConfig";

const lifecycleStates: ReadonlyArray<ItwLifecycleState> = [
  ItwLifecycleState.INSTALLED,
  ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE,
  ItwLifecycleState.INSTALLED_IT_WALLET_UNSUPPORTED,
  ItwLifecycleState.VALID_DOC_IO,
  ItwLifecycleState.VALID_DOC_IO_UPGRADABLE,
  ItwLifecycleState.VALID_DOC_IO_FALLBACK,
  ItwLifecycleState.VALID_IT_WALLET
];

const activeStates: ReadonlyArray<ItwLifecycleState> = [
  ItwLifecycleState.VALID_DOC_IO,
  ItwLifecycleState.VALID_DOC_IO_UPGRADABLE,
  ItwLifecycleState.VALID_DOC_IO_FALLBACK,
  ItwLifecycleState.VALID_IT_WALLET
];

const deviceOffline = setOfflineAccessReason(
  OfflineAccessReasonEnum.DEVICE_OFFLINE
);

/** An online state with every banner visible, plus the given actions. */
const stateWith = (...actions: ReadonlyArray<Action>) =>
  reproduceSequence({} as GlobalState, appReducer, [
    applicationChangeState("active"),
    setConnectionStatus(true),
    itwSetWalletInstanceRemotelyActive(false),
    ...actions
  ]);

const mockLifecycle = (lifecycle: ItwLifecycleState) =>
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleStateSelector")
    .mockReturnValue(lifecycle);

const mockItwEnabled = (enabled: boolean) =>
  jest
    .spyOn(remoteConfigSelectors, "isItwEnabledSelector")
    .mockReturnValue(enabled);

beforeEach(() => {
  mockItwEnabled(true);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe("banner selectors", () => {
  const l3UpgradeStates: ReadonlyArray<ItwLifecycleState> = [
    ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE,
    ItwLifecycleState.INSTALLED_IT_WALLET_UNSUPPORTED,
    ItwLifecycleState.VALID_DOC_IO_UPGRADABLE,
    ItwLifecycleState.VALID_DOC_IO_FALLBACK
  ];

  const banners: ReadonlyArray<{
    name: string;
    renderedIn: ReadonlyArray<ItwLifecycleState>;
    selector: (state: GlobalState) => boolean;
  }> = [
    {
      name: "isItwDiscoveryBannerRenderableSelector",
      selector: isItwDiscoveryBannerRenderableSelector,
      renderedIn: [ItwLifecycleState.INSTALLED]
    },
    {
      name: "itwShouldRenderDiscoveryBannerSelector",
      selector: itwShouldRenderDiscoveryBannerSelector,
      renderedIn: [ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE]
    },
    {
      name: "itwShouldRenderWalletDiscoveryBannerSelector",
      selector: itwShouldRenderWalletDiscoveryBannerSelector,
      renderedIn: [ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE]
    },
    {
      name: "itwShouldRenderInboxDiscoveryBannerSelector",
      selector: itwShouldRenderInboxDiscoveryBannerSelector,
      renderedIn: [ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE]
    },
    {
      name: "itwShouldRenderUpgradeBannerSelector",
      selector: itwShouldRenderUpgradeBannerSelector,
      renderedIn: [ItwLifecycleState.VALID_DOC_IO_UPGRADABLE]
    },
    {
      name: "itwShouldRenderL2EngagementBannerForInactiveWalletSelector",
      selector: itwShouldRenderL2EngagementBannerForInactiveWalletSelector,
      renderedIn: [ItwLifecycleState.INSTALLED_IT_WALLET_UNSUPPORTED]
    },
    {
      name: "itwShouldRenderL2EngagementBannerSelector",
      selector: itwShouldRenderL2EngagementBannerSelector,
      renderedIn: [ItwLifecycleState.VALID_DOC_IO_FALLBACK]
    },
    {
      name: "itwShouldRenderL3UpgradeBannerSelector",
      selector: itwShouldRenderL3UpgradeBannerSelector,
      renderedIn: l3UpgradeStates
    },
    {
      name: "itwShouldRenderWalletUpgradeMDLDetailsBannerSelector",
      selector: itwShouldRenderWalletUpgradeMDLDetailsBannerSelector,
      renderedIn: l3UpgradeStates
    }
  ];

  test.each(
    banners
      .flatMap(({ name, selector, renderedIn }) =>
        lifecycleStates.map(lifecycle => ({
          name,
          selector,
          lifecycle,
          expected: renderedIn.includes(lifecycle)
        }))
      )
      .map(row => ({ ...row, lifecycleName: ItwLifecycleState[row.lifecycle] }))
  )(
    "$name returns $expected with $lifecycleName",
    ({ selector, lifecycle, expected }) => {
      mockLifecycle(lifecycle);
      expect(selector(stateWith())).toBe(expected);
    }
  );

  test.each(banners)(
    "$name returns false while offline",
    ({ selector, renderedIn }) => {
      mockLifecycle(renderedIn[0]);
      expect(selector(stateWith(deviceOffline))).toBe(false);
    }
  );

  test.each(banners)(
    "$name returns false when IT-Wallet is remotely disabled",
    ({ selector, renderedIn }) => {
      mockItwEnabled(false);
      mockLifecycle(renderedIn[0]);
      expect(selector(stateWith())).toBe(false);
    }
  );

  test.each<{
    action: Action;
    lifecycle: ItwLifecycleState;
    name: string;
    reason: string;
    selector: (state: GlobalState) => boolean;
  }>([
    {
      name: "itwShouldRenderWalletDiscoveryBannerSelector",
      selector: itwShouldRenderWalletDiscoveryBannerSelector,
      lifecycle: ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE,
      reason: "the banner was closed",
      action: itwCloseBanner("discovery_wallet")
    },
    {
      name: "itwShouldRenderInboxDiscoveryBannerSelector",
      selector: itwShouldRenderInboxDiscoveryBannerSelector,
      lifecycle: ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE,
      reason: "the banner was closed",
      action: itwCloseBanner("discovery_messages_inbox")
    },
    {
      name: "itwShouldRenderInboxDiscoveryBannerSelector",
      selector: itwShouldRenderInboxDiscoveryBannerSelector,
      lifecycle: ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE,
      reason: "the wallet instance is remotely active",
      action: itwSetWalletInstanceRemotelyActive(true)
    },
    {
      name: "itwShouldRenderInboxDiscoveryBannerSelector",
      selector: itwShouldRenderInboxDiscoveryBannerSelector,
      lifecycle: ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE,
      reason: "the wallet instance remote status is unknown",
      action: itwSetWalletInstanceRemotelyActive(undefined)
    },
    {
      name: "itwShouldRenderUpgradeBannerSelector",
      selector: itwShouldRenderUpgradeBannerSelector,
      lifecycle: ItwLifecycleState.VALID_DOC_IO_UPGRADABLE,
      reason: "the banner was closed",
      action: itwCloseBanner("discovery_wallet")
    },
    {
      name: "itwShouldRenderWalletUpgradeMDLDetailsBannerSelector",
      selector: itwShouldRenderWalletUpgradeMDLDetailsBannerSelector,
      lifecycle: ItwLifecycleState.VALID_DOC_IO_UPGRADABLE,
      reason: "the banner was closed",
      action: itwCloseBanner("upgradeMDLDetails")
    }
  ])("$name returns false when $reason", ({ selector, lifecycle, action }) => {
    mockLifecycle(lifecycle);
    expect(selector(stateWith(action))).toBe(false);
  });
});

describe("itwShouldRenderWalletReadyBannerSelector", () => {
  const mockWallet = ({
    eidStatus = "valid",
    isWalletEmpty = true,
    walletInstanceFailure = false
  }: {
    eidStatus?: ReturnType<
      typeof credentialsSelectors.itwCredentialsEidStatusSelector
    >;
    isWalletEmpty?: boolean;
    walletInstanceFailure?: boolean;
  }) => {
    jest
      .spyOn(
        walletInstanceSelectors,
        "itwIsWalletInstanceStatusFailureSelector"
      )
      .mockReturnValue(walletInstanceFailure);
    jest
      .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
      .mockReturnValue(eidStatus);
    jest
      .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
      .mockReturnValue(isWalletEmpty);
  };

  test.each(
    lifecycleStates
      .map(lifecycle => ({
        lifecycle,
        expected: activeStates.includes(lifecycle)
      }))
      .map(row => ({ ...row, lifecycleName: ItwLifecycleState[row.lifecycle] }))
  )(
    "returns $expected with an empty $lifecycleName wallet",
    ({ lifecycle, expected }) => {
      mockLifecycle(lifecycle);
      mockWallet({});
      expect(itwShouldRenderWalletReadyBannerSelector(stateWith())).toBe(
        expected
      );
    }
  );

  test.each<{
    actions?: ReadonlyArray<Action>;
    name: string;
    wallet: Parameters<typeof mockWallet>[0];
  }>([
    { name: "offline", actions: [deviceOffline], wallet: {} },
    {
      name: "the wallet instance has failed",
      wallet: { walletInstanceFailure: true }
    },
    { name: "the eID is expiring", wallet: { eidStatus: "jwtExpiring" } },
    { name: "the eID is expired", wallet: { eidStatus: "jwtExpired" } },
    { name: "the wallet is not empty", wallet: { isWalletEmpty: false } }
  ])("returns false when $name", ({ actions = [], wallet }) => {
    mockLifecycle(ItwLifecycleState.VALID_DOC_IO);
    mockWallet(wallet);
    expect(
      itwShouldRenderWalletReadyBannerSelector(stateWith(...actions))
    ).toBe(false);
  });
});

describe("itwOfflineAccessAvailableSelector", () => {
  test.each(
    lifecycleStates
      .map(lifecycle => ({
        lifecycle,
        expected: activeStates.includes(lifecycle)
      }))
      .map(row => ({ ...row, lifecycleName: ItwLifecycleState[row.lifecycle] }))
  )(
    "returns $expected with a non-empty $lifecycleName wallet",
    ({ lifecycle, expected }) => {
      mockLifecycle(lifecycle);
      jest
        .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
        .mockReturnValue(false);
      expect(itwOfflineAccessAvailableSelector(stateWith())).toBe(expected);
    }
  );

  it("returns false with an empty wallet", () => {
    mockLifecycle(ItwLifecycleState.VALID_IT_WALLET);
    jest
      .spyOn(credentialsSelectors, "itwIsWalletEmptySelector")
      .mockReturnValue(true);
    expect(itwOfflineAccessAvailableSelector(stateWith())).toBe(false);
  });
});

describe("itwShouldRenderNewItWalletSelector", () => {
  test.each(
    lifecycleStates
      .map(lifecycle => ({
        lifecycle,
        expected: lifecycle === ItwLifecycleState.VALID_IT_WALLET
      }))
      .map(row => ({ ...row, lifecycleName: ItwLifecycleState[row.lifecycle] }))
  )("returns $expected with $lifecycleName", ({ lifecycle, expected }) => {
    mockLifecycle(lifecycle);
    expect(itwShouldRenderNewItWalletSelector(stateWith())).toBe(expected);
  });

  test.each<{
    actions: ReadonlyArray<Action>;
    expected: boolean;
    name: string;
  }>([
    { name: "online", actions: [], expected: false },
    { name: "the device is offline", actions: [deviceOffline], expected: true },
    {
      name: "there is no connection",
      actions: [setConnectionStatus(false)],
      expected: true
    }
  ])(
    "returns $expected for IT-Wallet remotely disabled when $name",
    ({ actions, expected }) => {
      mockItwEnabled(false);
      mockLifecycle(ItwLifecycleState.VALID_IT_WALLET);
      expect(itwShouldRenderNewItWalletSelector(stateWith(...actions))).toBe(
        expected
      );
    }
  );
});

describe("isItwProximityEnabledSelector", () => {
  test.each<{
    expected: boolean;
    hasPresentableCredentials?: boolean;
    isItwEnabled?: boolean;
    isProximityVersionSupported?: boolean;
    lifecycle?: ItwLifecycleState;
    name: string;
  }>([
    { name: "IT-Wallet is active", expected: true },
    {
      name: "the proximity version is not supported",
      isProximityVersionSupported: false,
      expected: false
    },
    {
      name: "there are no presentable credentials",
      hasPresentableCredentials: false,
      expected: false
    },
    {
      name: "Documenti su IO is active",
      lifecycle: ItwLifecycleState.VALID_DOC_IO_UPGRADABLE,
      expected: false
    },
    {
      name: "IT-Wallet is remotely disabled",
      isItwEnabled: false,
      expected: false
    }
  ])(
    "returns $expected when $name",
    ({
      lifecycle = ItwLifecycleState.VALID_IT_WALLET,
      isItwEnabled = true,
      isProximityVersionSupported = true,
      hasPresentableCredentials = true,
      expected
    }) => {
      mockLifecycle(lifecycle);
      mockItwEnabled(isItwEnabled);
      jest
        .spyOn(
          remoteConfigSelectors,
          "isItwProximityMinAppVersionSupportedSelector"
        )
        .mockReturnValue(isProximityVersionSupported);
      jest
        .spyOn(
          proximityCredentialsSelectors,
          "hasPresentableCredentialsSelector"
        )
        .mockReturnValue(hasPresentableCredentials);

      expect(isItwProximityEnabledSelector(stateWith())).toBe(expected);
    }
  );
});
