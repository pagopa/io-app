import I18n from "i18next";
import configureMockStore from "redux-mock-store";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { ItwStoredCredentialsMocks } from "../../utils/itwMocksUtils";
import { CredentialMetadata } from "../../utils/itwTypesUtils";
import { ItwIssuanceMetadata } from "../ItwIssuanceMetadata";

/** Privacy policy served by IPZS to Documenti su IO, which must never change. */
const DOCUMENTS_ON_IO_PRIVACY_URL = "https://io.italia.it/informativa-ipzs";
const ITWALLET_PRIVACY_URL = "https://example.com/itwallet-privacy";

const privacyDisclaimer = (privacyUrl: string) =>
  I18n.t(
    "features.itWallet.issuance.credentialPreview.bottomSheet.about.subtitle",
    { privacyUrl }
  );

const mockIsL3Selector = (isL3: boolean) =>
  jest
    .spyOn(lifecycleSelectors, "itwLifecycleIsITWalletValidSelector")
    .mockReturnValue(isL3);

const asItwCredential = (
  credential: CredentialMetadata
): CredentialMetadata => ({
  ...credential,
  verification: {
    assurance_level: "high",
    trust_framework: "it_cie"
  }
});

describe("ItwIssuanceMetadata", () => {
  it("displays the hardcoded 'IT Wallet' data source for the proof_of_age credential", () => {
    const { queryByText } = renderComponent(
      ItwStoredCredentialsMocks.L3.proofOfAge
    );

    const authSourceLabel = I18n.t(
      "features.itWallet.verifiableCredentials.claims.authenticSource"
    );

    expect(queryByText(authSourceLabel)).not.toBeNull();
    expect(queryByText("IT-Wallet ID")).not.toBeNull();
  });

  describe("releaser", () => {
    const releasedByLabel = I18n.t(
      "features.itWallet.verifiableCredentials.claims.releasedBy"
    );
    const releasedByPidLabel = I18n.t(
      "features.itWallet.verifiableCredentials.claims.releasedByPid"
    );

    test.each([
      {
        name: "Documenti su IO credential",
        credential: ItwStoredCredentialsMocks.mdl,
        releasedByVisible: true,
        releasedByPidVisible: false
      },
      {
        name: "IT-Wallet credential",
        credential: asItwCredential(ItwStoredCredentialsMocks.L3.mdl),
        releasedByVisible: false,
        releasedByPidVisible: false
      },
      {
        name: "IT-Wallet PID",
        credential: asItwCredential(ItwStoredCredentialsMocks.eid),
        releasedByVisible: false,
        releasedByPidVisible: true
      }
    ])(
      "renders the expected releaser for $name",
      ({ credential, releasedByVisible, releasedByPidVisible }) => {
        const { queryByText } = renderComponent(credential);

        expect(queryByText(releasedByLabel) !== null).toBe(releasedByVisible);
        expect(queryByText(releasedByPidLabel) !== null).toBe(
          releasedByPidVisible
        );
      }
    );
  });

  describe("privacy policy link", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("keeps the original IPZS privacy policy for Documenti su IO", () => {
      mockIsL3Selector(false);

      const { queryByText } = renderComponent(ItwStoredCredentialsMocks.mdl);

      expect(
        queryByText(privacyDisclaimer(DOCUMENTS_ON_IO_PRIVACY_URL))
      ).not.toBeNull();
    });

    it("uses the IT-Wallet privacy policy from the remote config for IT-Wallet", () => {
      mockIsL3Selector(true);

      const { queryByText } = renderComponent(ItwStoredCredentialsMocks.mdl, {
        ipzs_itwallet_privacy_url: ITWALLET_PRIVACY_URL
      });

      expect(
        queryByText(privacyDisclaimer(ITWALLET_PRIVACY_URL))
      ).not.toBeNull();
      expect(
        queryByText(privacyDisclaimer(DOCUMENTS_ON_IO_PRIVACY_URL))
      ).toBeNull();
    });
  });
});

const renderComponent = (
  credential: CredentialMetadata,
  itwRemoteConfig: object = {}
) => {
  const globalState = appReducer(undefined, applicationChangeState("active"));

  const mockStore = configureMockStore<GlobalState>();
  const store: ReturnType<typeof mockStore> = mockStore({
    ...globalState,
    features: {
      ...globalState.features,
      itWallet: {
        ...globalState.features.itWallet,
        remoteConfig: {
          ...globalState.features.itWallet.remoteConfig,
          ...itwRemoteConfig
        }
      }
    }
  } as GlobalState);

  return renderScreenWithNavigationStoreContext<GlobalState>(
    () => <ItwIssuanceMetadata credential={credential} />,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
