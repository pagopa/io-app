import { fireEvent } from "@testing-library/react-native";
import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../../store/actions/application";
import { appReducer } from "../../../../../../store/reducers";
import { GlobalState } from "../../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../../utils/testWrapper";
import { itwCloseBanner } from "../../../../common/store/actions/banners";
import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils";
import * as credentialSelectors from "../../../../credentials/store/selectors";
import * as lifecycleSelectors from "../../../../lifecycle/store/selectors";
import { ITW_ROUTES } from "../../../../navigation/routes";
import { ItwPresentationCredentialInfoAlert } from "../ItwPresentationCredentialInfoAlert";

const mockedMdl: CredentialMetadata = {
  credentialType: "mDL",
  credentialId: "dc_sd_jwt_mDL",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "1",
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2100-09-04T00:00:00.000Z"
  },
  spec_version: "1.0.0"
};

const mockedEhc: CredentialMetadata = {
  ...mockedMdl,
  credentialType: "EuropeanHealthInsuranceCard",
  credentialId: "dc_sd_jwt_EuropeanHealthInsuranceCard"
};

const mockStatusSelector = (
  status: ReturnType<typeof credentialSelectors.itwCredentialStatusSelector>
) =>
  jest
    .spyOn(credentialSelectors, "itwCredentialStatusSelector")
    .mockImplementation(() => status);

const mockIsL3Selector = (isL3: boolean) =>
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
    .mockReturnValue(isL3);

describe("ItwPresentationCredentialInfoAlert", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("MDL - L2 (Documenti su IO)", () => {
    it("renders the legacy alert when the credential is valid", () => {
      mockStatusSelector({ status: "valid" });
      mockIsL3Selector(false);

      const { getByText, getByTestId, queryByLabelText } =
        renderComponent(mockedMdl);

      expect(getByTestId("itwMdlBannerTestID")).not.toBeNull();
      expect(
        getByText(I18n.t("features.itWallet.presentation.alerts.mdl.content"))
      ).not.toBeNull();
      // No close action on the L2 alert
      expect(queryByLabelText(I18n.t("global.buttons.close"))).toBeNull();
    });

    it("renders nothing when the credential status is not valid", () => {
      mockStatusSelector({ status: "expired" });
      mockIsL3Selector(false);

      const { queryByTestId } = renderComponent(mockedMdl);

      expect(queryByTestId("itwMdlBannerTestID")).toBeNull();
    });
  });

  describe("MDL - L3 (IT-Wallet)", () => {
    it("renders the informational banner when the credential is valid", () => {
      mockStatusSelector({ status: "valid" });
      mockIsL3Selector(true);

      const { getByText, getByTestId } = renderComponent(mockedMdl);

      expect(getByTestId("itwMdlBannerTestID")).not.toBeNull();
      expect(
        getByText(I18n.t("features.itWallet.presentation.alerts.mdl.title"))
      ).not.toBeNull();
      expect(
        getByText(I18n.t("features.itWallet.presentation.alerts.mdl.contentL3"))
      ).not.toBeNull();
    });

    it("renders nothing when the credential status is not valid", () => {
      mockStatusSelector({ status: "expired" });
      mockIsL3Selector(true);

      const { queryByTestId } = renderComponent(mockedMdl);

      expect(queryByTestId("itwMdlBannerTestID")).toBeNull();
    });

    it("dispatches the close action when dismissed", () => {
      mockStatusSelector({ status: "valid" });
      mockIsL3Selector(true);

      const { getByLabelText, store } = renderComponent(mockedMdl);

      fireEvent.press(getByLabelText(I18n.t("global.buttons.close")));

      expect(store.getActions()).toContainEqual(
        itwCloseBanner("mdlDetailsInfo")
      );
    });
  });

  describe("EHC", () => {
    it("renders the informational alert when the credential is valid", () => {
      mockStatusSelector({ status: "valid" });

      const { getByTestId } = renderComponent(mockedEhc);

      expect(getByTestId("itwEhcBannerTestID")).not.toBeNull();
    });

    it("renders nothing when the credential status is not valid", () => {
      mockStatusSelector({ status: "expired" });

      const { queryByTestId } = renderComponent(mockedEhc);

      expect(queryByTestId("itwEhcBannerTestID")).toBeNull();
    });
  });
});

function renderComponent(credential: CredentialMetadata) {
  const globalState = appReducer(undefined, applicationChangeState("active"));
  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore(globalState);

  return {
    ...renderScreenWithNavigationStoreContext<GlobalState>(
      () => <ItwPresentationCredentialInfoAlert credential={credential} />,
      ITW_ROUTES.PRESENTATION.CREDENTIAL_DETAIL,
      {},
      store
    ),
    store
  };
}
