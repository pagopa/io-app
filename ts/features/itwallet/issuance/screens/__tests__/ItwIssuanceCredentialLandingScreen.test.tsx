import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import ROUTES from "../../../../../navigation/routes";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import * as preferencesSelectors from "../../../common/store/selectors/preferences";
import * as credentialsSelectors from "../../../credentials/store/selectors";
import { ITW_ROUTES } from "../../../navigation/routes";
import { ItwIssuanceCredentialLandingScreen } from "../ItwIssuanceCredentialLandingScreen";

const mockReplace = jest.fn();
const mockNavigate = jest.fn();
const mockPopToTop = jest.fn();
const mockReset = jest.fn();

jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    replace: mockReplace,
    navigate: mockNavigate,
    popToTop: mockPopToTop,
    reset: mockReset
  })
}));

describe("ItwIssuanceCredentialLandingScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Navigation scenarios", () => {
    test.each`
      credentialStatus | pidStatus    | isItwValid | isWhitelisted | expectedRoute                                  | expectedParams
      ${undefined}     | ${undefined} | ${false}   | ${false}      | ${ITW_ROUTES.DISCOVERY.INFO}                   | ${{ animationEnabled: false, level: "l2", credentialType: "mDL" }}
      ${undefined}     | ${undefined} | ${false}   | ${true}       | ${ITW_ROUTES.DISCOVERY.INFO}                   | ${{ animationEnabled: false, level: "l3", credentialType: "mDL" }}
      ${undefined}     | ${undefined} | ${true}    | ${false}      | ${ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER} | ${{ animationEnabled: false, credentialType: "mDL" }}
      ${undefined}     | ${undefined} | ${true}    | ${true}       | ${ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER} | ${{ animationEnabled: false, credentialType: "mDL" }}
      ${"jwtExpired"}  | ${undefined} | ${false}   | ${false}      | ${ITW_ROUTES.DISCOVERY.INFO}                   | ${{ animationEnabled: false, level: "l2", credentialType: "mDL" }}
      ${"jwtExpiring"} | ${undefined} | ${true}    | ${false}      | ${ITW_ROUTES.ISSUANCE.CREDENTIAL_TRUST_ISSUER} | ${{ animationEnabled: false, credentialType: "mDL" }}
    `(
      "navigates to $expectedRoute when credentialStatus=$credentialStatus, pidStatus=$pidStatus, isItwValid=$isItwValid, isWhitelisted=$isWhitelisted",
      ({
        credentialStatus,
        pidStatus,
        isItwValid,
        isWhitelisted,
        expectedRoute,
        expectedParams
      }) => {
        mockSelectors({
          credentialStatus,
          pidStatus,
          isItwValid,
          isWhitelisted
        });

        renderComponent();

        expect(mockReplace).toHaveBeenCalledWith(expectedRoute, expectedParams);
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

    it("primary action navigates to identification with level l2 when not whitelisted", () => {
      mockSelectors({ pidStatus: "jwtExpired", isWhitelisted: false });

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
          level: "l2"
        }
      });
    });

    it("primary action navigates to identification with level l3 when whitelisted", () => {
      mockSelectors({
        pidStatus: "jwtExpired",
        isWhitelisted: true
      });

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
          level: "l3"
        }
      });
    });

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
});

type MockSelectorOptions = {
  credentialStatus?: string;
  pidStatus?: string;
  isItwValid?: boolean;
  isWhitelisted?: boolean;
};

const mockSelectors = ({
  credentialStatus,
  pidStatus,
  isItwValid = false,
  isWhitelisted = false
}: MockSelectorOptions = {}) => {
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleIsValidSelector")
    .mockReturnValue(isItwValid);
  jest
    .spyOn(preferencesSelectors, "itwIsL3EnabledSelector")
    .mockReturnValue(isWhitelisted);
  jest
    .spyOn(credentialsSelectors, "itwCredentialStatusSelector")
    .mockImplementation(
      () => ({ status: credentialStatus, message: undefined } as any)
    );
  jest
    .spyOn(credentialsSelectors, "itwCredentialsEidStatusSelector")
    .mockReturnValue(pidStatus as any);
};

const renderComponent = () => {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store = mockStore(globalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    ItwIssuanceCredentialLandingScreen,
    ITW_ROUTES.LANDING.CREDENTIAL_ISSUANCE,
    { credentialType: "mDL" },
    store
  );
};
