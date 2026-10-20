import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { startupLoadSuccess } from "../../../../../store/actions/startup";
import { appReducer } from "../../../../../store/reducers";
import { StartupStatusEnum } from "../../../../../store/reducers/startup";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import * as credentialsCatalogueSelectors from "../../../credentialsCatalogue/store/selectors";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceCredentialLandingScreen } from "../ItwIssuanceCredentialLandingScreen";

const mockReplace = jest.fn();
const mockNavigate = jest.fn();
const mockPopToTop = jest.fn();
const mockReset = jest.fn();
const mockTrackItwAlreadyHasCredential = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    replace: mockReplace,
    navigate: mockNavigate,
    popToTop: mockPopToTop,
    reset: mockReset
  })
}));

jest.mock("../../analytics", () => ({
  ...jest.requireActual("../../analytics"),
  trackItwAlreadyHasCredential: (credential: unknown) =>
    mockTrackItwAlreadyHasCredential(credential)
}));

describe("ItwIssuanceCredentialLandingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("waits for authenticated startup before navigating or tracking", () => {
    mockSelectors({ credentialStatus: "valid" });

    const { getByText } = renderComponent(StartupStatusEnum.INITIAL);

    expect(getByText(I18n.t("global.genericWaiting"))).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockTrackItwAlreadyHasCredential).not.toHaveBeenCalled();
  });

  describe("Navigation scenarios", () => {
    const discoveryInfo = (level: "l2" | "l3") => [
      ITW_ROUTES.DISCOVERY.INFO,
      { animationEnabled: false, level, credentialType: "mDL" }
    ];
    const trustIssuer = [
      ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
      { animationEnabled: false, credentialType: "mDL" }
    ];

    test.each(
      (
        [
          {
            lifecycle: lifecycleSelectors.ItwLifecycleState.INSTALLED,
            expectedArgs: discoveryInfo("l2")
          },
          {
            lifecycle:
              lifecycleSelectors.ItwLifecycleState.INSTALLED_IT_WALLET_ELIGIBLE,
            expectedArgs: discoveryInfo("l3")
          },
          {
            lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO,
            expectedArgs: trustIssuer
          },
          {
            lifecycle:
              lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_UPGRADABLE,
            expectedArgs: trustIssuer
          },
          {
            lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_IT_WALLET,
            expectedArgs: trustIssuer
          },
          {
            credentialStatus: "jwtExpired",
            lifecycle: lifecycleSelectors.ItwLifecycleState.INSTALLED,
            expectedArgs: discoveryInfo("l2")
          },
          {
            credentialStatus: "jwtExpiring",
            lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO,
            expectedArgs: trustIssuer
          }
        ] satisfies Array<{
          credentialStatus?: string;
          expectedArgs: ReadonlyArray<unknown>;
          lifecycle: lifecycleSelectors.ItwLifecycleState;
        }>
      ).map(row => ({
        ...row,
        lifecycleName: lifecycleSelectors.ItwLifecycleState[row.lifecycle]
      }))
    )(
      "navigates to the expected route when credentialStatus=$credentialStatus, lifecycle=$lifecycleName",
      ({ credentialStatus, lifecycle, expectedArgs }) => {
        mockSelectors({ credentialStatus, lifecycle });

        renderComponent();

        expect(mockReplace).toHaveBeenCalledWith(...expectedArgs);
      }
    );
  });

  describe("Credential already valid UI", () => {
    it("renders the credential already updated screen", () => {
      mockSelectors({ credentialStatus: "valid" });

      const { getByText } = renderComponent();

      expect(
        getByText(
          I18n.t("features.itWallet.issuance.credentialAlreadyUpdated.title")
        )
      ).toBeTruthy();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("tracks the already updated KO when the credential is already valid", () => {
      mockSelectors({ credentialStatus: "valid" });

      renderComponent();

      expect(mockTrackItwAlreadyHasCredential).toHaveBeenCalledWith(
        "ITW_PG_V2"
      );
    });

    it("primary action navigates to wallet home", () => {
      mockSelectors({ credentialStatus: "valid" });

      const { getByText } = renderComponent();

      fireEvent.press(
        getByText(
          I18n.t("features.itWallet.issuance.credentialAlreadyUpdated.action")
        )
      );

      expect(mockReset).toHaveBeenCalledWith({
        index: 1,
        routes: [
          {
            name: ROUTES.MAIN,
            params: {
              screen: ROUTES.WALLET_HOME
            }
          }
        ]
      });
    });

    it("secondary action calls popToTop", () => {
      mockSelectors({ credentialStatus: "valid" });

      const { getByText } = renderComponent();

      fireEvent.press(getByText(I18n.t("global.buttons.close")));

      expect(mockPopToTop).toHaveBeenCalled();
    });
  });

  describe("EID expired/expiring UI", () => {
    it.each(["jwtExpired", "jwtExpiring"] as const)(
      "renders the confirm identity screen when pidStatus=%s",
      pidStatus => {
        mockSelectors({ pidStatus });

        const { getByText } = renderComponent();

        expect(
          getByText(
            I18n.t("features.itWallet.issuance.confirmIdentity.primaryAction")
          )
        ).toBeTruthy();
        expect(mockReplace).not.toHaveBeenCalled();
      }
    );

    test.each(
      (
        [
          {
            lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO,
            level: "l2"
          },
          {
            lifecycle:
              lifecycleSelectors.ItwLifecycleState.VALID_DOC_IO_UPGRADABLE,
            level: "l3"
          },
          {
            lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_IT_WALLET,
            level: "l3"
          }
        ] satisfies Array<{
          level: "l2" | "l3";
          lifecycle: lifecycleSelectors.ItwLifecycleState;
        }>
      ).map(row => ({
        ...row,
        lifecycleName: lifecycleSelectors.ItwLifecycleState[row.lifecycle]
      }))
    )(
      "primary action navigates to identification with level $level when the lifecycle is $lifecycleName",
      ({ lifecycle, level }) => {
        mockSelectors({ pidStatus: "jwtExpired", lifecycle });

        const { getByText } = renderComponent();

        fireEvent.press(
          getByText(
            I18n.t("features.itWallet.issuance.confirmIdentity.primaryAction")
          )
        );

        expect(mockNavigate).toHaveBeenCalledWith(ITW_ROUTES.MAIN, {
          screen: ITW_ROUTES.IDENTIFICATION.MODE_SELECTION,
          params: {
            eidReissuing: true,
            credentialType: "mDL",
            level
          }
        });
      }
    );

    it("secondary action calls popToTop", () => {
      mockSelectors({ pidStatus: "jwtExpiring" });

      const { getByText } = renderComponent();

      fireEvent.press(
        getByText(
          I18n.t("features.itWallet.issuance.confirmIdentity.secondaryAction")
        )
      );

      expect(mockPopToTop).toHaveBeenCalled();
    });
  });

  describe("Priority: EID expiring > credential valid", () => {
    it("shows confirm identity UI when both credential is valid and EID is expired", () => {
      mockSelectors({
        credentialStatus: "valid",
        pidStatus: "jwtExpired"
      });

      const { getByText, queryByText } = renderComponent();

      expect(
        getByText(
          I18n.t("features.itWallet.issuance.confirmIdentity.primaryAction")
        )
      ).toBeTruthy();
      expect(
        queryByText(
          I18n.t("features.itWallet.issuance.credentialAlreadyUpdated.title")
        )
      ).toBeNull();
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  describe("Introduction content routing", () => {
    it("navigates to the introduction screen when the credential has intro content", () => {
      mockSelectors({
        lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_IT_WALLET,
        hasIntroContent: true
      });

      renderComponent();

      expect(mockReplace).toHaveBeenCalledWith(
        ITW_ROUTES.ISSUANCE.CREDENTIAL_INTRODUCTION,
        { animationEnabled: false, credentialType: "mDL" }
      );
    });

    it("navigates to the trust issuer screen when the credential has no intro content", () => {
      mockSelectors({
        lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_IT_WALLET,
        hasIntroContent: false
      });

      renderComponent();

      expect(mockReplace).toHaveBeenCalledWith(
        ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER,
        { animationEnabled: false, credentialType: "mDL" }
      );
    });
  });

  describe("Landing error screen", () => {
    it("renders the error screen as fallback", () => {
      mockSelectors({
        credentialStatus: undefined,
        pidStatus: undefined,
        lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_IT_WALLET
      });

      const { getByText } = renderComponent();

      expect(
        getByText(I18n.t(`features.itWallet.issuance.landingError.title`))
      ).toBeTruthy();
    });

    it("primary action navigates to CTA message", () => {
      mockSelectors({
        credentialStatus: undefined,
        pidStatus: undefined,
        lifecycle: lifecycleSelectors.ItwLifecycleState.VALID_IT_WALLET
      });

      const { getByText } = renderComponent();

      fireEvent.press(
        getByText(I18n.t(`features.itWallet.issuance.landingError.action`))
      );

      expect(mockPopToTop).toHaveBeenCalled();
    });
  });
});

type MockSelectorOptions = {
  credentialStatus?: string;
  hasIntroContent?: boolean;
  lifecycle?: lifecycleSelectors.ItwLifecycleState;
  pidStatus?: string;
};

const mockSelectors = ({
  credentialStatus,
  pidStatus,
  lifecycle = lifecycleSelectors.ItwLifecycleState.INSTALLED,
  hasIntroContent = false
}: MockSelectorOptions = {}) => {
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleStateSelector")
    .mockReturnValue(lifecycle);
  jest
    .spyOn(credentialsSelectors, "itwCredentialStatusSelector")
    .mockImplementation(() => ({ status: credentialStatus }) as any);
  jest
    .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
    .mockReturnValue(pidStatus as any);
  jest
    .spyOn(credentialsCatalogueSelectors, "itwCredentialIntroContentSelector")
    .mockReturnValue(() => (hasIntroContent ? "intro content" : undefined));
};

const renderComponent = (startupStatus = StartupStatusEnum.AUTHENTICATED) => {
  const stateAfterApplicationChange = appReducer(
    undefined,
    applicationChangeState("active")
  );
  const globalState = appReducer(
    stateAfterApplicationChange,
    startupLoadSuccess(startupStatus)
  );
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwIssuanceCredentialLandingScreen,
    ITW_ROUTES.LANDING.CREDENTIAL_ISSUANCE,
    { credentialType: "mDL" },
    store
  );
};
