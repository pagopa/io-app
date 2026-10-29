import { ListItemInfo } from "@io-app/design-system";
import { act, waitFor } from "@testing-library/react-native";
import { Buffer } from "buffer";
import I18n from "i18next";
import { Image } from "react-native";
import configureMockStore from "redux-mock-store";

import ROUTES from "../../../../../navigation/routes";
import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { renderScreenWithNavigationStoreContext } from "../../../../../utils/testWrapper";
import { itwFetchCredentialsCatalogue } from "../../../credentialsCatalogue/store/actions";
import * as lifecycleSelectors from "../../../lifecycle/store/selectors";
import { getEnv } from "../../utils/environment";
import {
  DigitalCredentialsCatalogue,
  fetchCredentialsCatalogue
} from "../../utils/itwCredentialsCatalogueUtils";
import { getIoWallet } from "../../utils/itwIoWallet";
import {
  ItwCredentialFromCatalogueMocks,
  ItwCredentialsCatalogueMock,
  ItwStoredCredentialsMocks
} from "../../utils/itwMocksUtils";
import { CredentialMetadata } from "../../utils/itwTypesUtils";
import { ItwIssuanceMetadata } from "../ItwIssuanceMetadata";

const datasetLogoBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const datasetLogoHash =
  "431ced6916a2a21a156e38701afe55bbd7f88969fbbfc56d7fe099d47f265460";
const imageResponse = {
  ok: true,
  headers: new Headers({ "content-type": "image/png" }),
  arrayBuffer: async () =>
    Uint8Array.from(Buffer.from(datasetLogoBase64, "base64")).buffer
} as Response;

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

describe("ItwIssuanceMetadata", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(globalThis, "fetch").mockResolvedValue(imageResponse);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("keeps the data source without an image when no logo is available", () => {
    const { UNSAFE_getAllByType, getByText } = renderComponent(
      ItwStoredCredentialsMocks.L3.proofOfAge
    );
    expect(
      UNSAFE_getAllByType(ListItemInfo).every(
        item => item.props.imageSource === undefined
      )
    ).toBe(true);
    expect(getByText("IT-Wallet ID")).toBeTruthy();
  });

  it.each([
    { name: "detail", isPreview: false, validHash: true },
    { name: "preview", isPreview: true, validHash: true },
    { name: "a hash mismatch", isPreview: false, validHash: false }
  ])(
    "shows only a verified wallet logo in $name",
    async ({ isPreview, validHash }) => {
      const credential = ItwStoredCredentialsMocks.L3.edat;
      const sourceName = "ANIS - Anagrafe Nazionale dell’istruzione superiore";
      const logoUri =
        "https://pre.ta.wallet.ipzs.it/img/authentic-sources/www.mim.gov.it/edu_att_001/logo_uri.png";
      const catalogue: DigitalCredentialsCatalogue = {
        ...ItwCredentialsCatalogueMock,
        credentials: [
          {
            ...ItwCredentialFromCatalogueMocks,
            credential_type: credential.credentialType,
            authentic_sources: [
              {
                ...ItwCredentialFromCatalogueMocks.authentic_sources[0],
                id: "https://www.mim.gov.it",
                organization_name: sourceName,
                logo_uri: "https://example.com/organization-logo.png",
                dataset_logo_uri: logoUri,
                "dataset_logo_uri#integrity": `sha-256-${validHash ? datasetLogoHash : "0".repeat(64)}`
              }
            ]
          }
        ]
      };
      const fetchAndParseCatalogue = jest
        .spyOn(
          getIoWallet("1.4.6").CredentialsCatalogue,
          "fetchAndParseCatalogue"
        )
        .mockResolvedValue(catalogue);
      const env = getEnv("pre");
      const response = await fetchCredentialsCatalogue(env, "1.4.6");

      const {
        UNSAFE_getByType,
        UNSAFE_queryByType,
        getByText,
        queryByLabelText
      } = renderComponent(credential, {}, isPreview, response);

      expect(fetchAndParseCatalogue).toHaveBeenCalledWith(
        env.WALLET_TA_BASE_URL
      );
      if (validHash) {
        await waitFor(() =>
          expect(UNSAFE_getByType(Image).props.source).toEqual({
            uri: `data:image/png;base64,${datasetLogoBase64}`
          })
        );
      } else {
        await act(async () => {
          await jest.mocked(globalThis.fetch).mock.results[0].value;
        });
        expect(UNSAFE_queryByType(Image)).toBeNull();
      }
      expect(globalThis.fetch).toHaveBeenCalledWith(
        logoUri,
        expect.objectContaining({ signal: expect.anything() })
      );
      expect(getByText(sourceName)).toBeTruthy();
      const infoLabel = `Info ${I18n.t("features.itWallet.verifiableCredentials.claims.authenticSource")}`;
      expect(!!queryByLabelText(infoLabel)).toBe(!isPreview);
    }
  );
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

  describe("privacy policy link", () => {
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
  itwRemoteConfig: object = {},
  isPreview = false,
  catalogue?: DigitalCredentialsCatalogue
) => {
  const initialState = appReducer(undefined, applicationChangeState("active"));
  const globalState = catalogue
    ? appReducer(initialState, itwFetchCredentialsCatalogue.success(catalogue))
    : initialState;

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
    () => <ItwIssuanceMetadata credential={credential} isPreview={isPreview} />,
    ROUTES.WALLET_HOME,
    {},
    store
  );
};
