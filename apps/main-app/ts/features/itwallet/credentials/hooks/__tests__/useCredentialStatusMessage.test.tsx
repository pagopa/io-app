import * as pot from "@pagopa/ts-commons/lib/pot";
import { renderHook } from "@testing-library/react-native";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";

import { applicationChangeState } from "../../../../../store/actions/application";
import { appReducer } from "../../../../../store/reducers";
import { GlobalState } from "../../../../../store/reducers/types";
import { DigitalCredentialMetadata } from "../../../common/utils/itwCredentialsCatalogueUtils";
import {
  CredentialStatusMessage,
  getCredentialStatusMessageFromCatalog,
  getCredentialStatusMessageFromIssuerConf
} from "../../../common/utils/itwCredentialStatusUtils";
import {
  CredentialType,
  ItwCredentialFromCatalogueMocks,
  ItwStoredCredentialsMocks
} from "../../../common/utils/itwMocksUtils";
import {
  CredentialMetadata,
  IssuerConfiguration
} from "../../../common/utils/itwTypesUtils";
import { useCredentialStatusMessage } from "../useCredentialStatusMessage";

// The extraction functions are covered by their own unit tests: here they are mocked
// to assert which source the hook selects and the arguments it forwards.
jest.mock("../../../common/utils/itwCredentialStatusUtils");

const mockedFromCatalog = jest.mocked(getCredentialStatusMessageFromCatalog);
const mockedFromIssuerConf = jest.mocked(
  getCredentialStatusMessageFromIssuerConf
);

const CREDENTIAL_TYPE = CredentialType.DRIVING_LICENSE;
const CREDENTIAL_ID = "MDL";
const RAW_STATUS = "0x02";
const ERROR_CODE = "credential_revoked";

const CATALOG_MESSAGE: CredentialStatusMessage = {
  title: "Sospesa",
  description: "La patente è sospesa"
};

const ISSUER_CONF_MESSAGE: CredentialStatusMessage = {
  title: "Revocata",
  description: "La patente è revocata"
};

const issuerConf = {
  credential_configurations_supported: {}
} as IssuerConfiguration;

const catalogMetadata: DigitalCredentialMetadata = {
  ...ItwCredentialFromCatalogueMocks,
  credential_type: CREDENTIAL_TYPE
};

const catalogTranslations = { "status.suspended.title": "Sospesa" };

const buildCredential = (
  validity?: CredentialMetadata["validity"]
): CredentialMetadata => ({
  ...ItwStoredCredentialsMocks.mdl,
  credentialType: CREDENTIAL_TYPE,
  credentialId: CREDENTIAL_ID,
  issuerConf,
  validity
});

type StoreOptions = {
  catalogue?: DigitalCredentialMetadata;
  credential?: CredentialMetadata;
  translations?: Record<string, string>;
};

const buildState = ({
  credential,
  catalogue = catalogMetadata,
  translations = catalogTranslations
}: StoreOptions): GlobalState => {
  const baseState = appReducer(undefined, applicationChangeState("active"));

  return {
    ...baseState,
    features: {
      ...baseState.features,
      itWallet: {
        ...baseState.features.itWallet,
        credentials: {
          ...baseState.features.itWallet.credentials,
          credentials: credential
            ? { [credential.credentialId]: credential }
            : {}
        },
        credentialsCatalogue: {
          ...baseState.features.itWallet.credentialsCatalogue,
          catalogue: pot.some({
            taxonomy_uri: "https://taxonomy.example.org",
            iat: 0,
            exp: 0,
            credentials: [catalogue]
          }),
          translations: pot.some({ it: translations })
        }
      }
    }
  } as GlobalState;
};

const renderStatusMessageHook = (options: StoreOptions) => {
  const state = buildState(options);
  const store = configureMockStore<GlobalState>()(state);

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return renderHook(() => useCredentialStatusMessage(CREDENTIAL_TYPE), {
    wrapper
  });
};

describe("useCredentialStatusMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedFromCatalog.mockReturnValue(CATALOG_MESSAGE);
    mockedFromIssuerConf.mockReturnValue(ISSUER_CONF_MESSAGE);
  });

  it("returns undefined without extracting any message when the credential is not stored", () => {
    const { result } = renderStatusMessageHook({ credential: undefined });

    expect(result.current).toBeUndefined();
    expect(mockedFromIssuerConf).not.toHaveBeenCalled();
    expect(mockedFromCatalog).not.toHaveBeenCalled();
  });

  describe("when the credential supports status assertion (legacy 1.0 credentials)", () => {
    it("extracts the message from the issuer configuration, forwarding the error code of an invalid credential", () => {
      const credential = buildCredential({
        type: "status_assertion",
        status: "invalid",
        errorCode: ERROR_CODE
      });

      const { result } = renderStatusMessageHook({ credential });

      expect(result.current).toBe(ISSUER_CONF_MESSAGE);
      expect(mockedFromIssuerConf).toHaveBeenCalledWith({
        errorCode: ERROR_CODE,
        issuerConf,
        credentialId: CREDENTIAL_ID
      });
      expect(mockedFromCatalog).not.toHaveBeenCalled();
    });

    it.each([
      {
        name: "unknown",
        validity: { type: "status_assertion", status: "unknown" } as const
      },
      {
        name: "valid",
        validity: {
          type: "status_assertion",
          status: "valid",
          statusAssertion: {} as any
        } as const
      }
    ])(
      "extracts the message from the issuer configuration without an error code when the status is $name",
      ({ validity }) => {
        const credential = buildCredential(validity);

        const { result } = renderStatusMessageHook({ credential });

        expect(result.current).toBe(ISSUER_CONF_MESSAGE);
        expect(mockedFromIssuerConf).toHaveBeenCalledWith({
          errorCode: undefined,
          issuerConf,
          credentialId: CREDENTIAL_ID
        });
        expect(mockedFromCatalog).not.toHaveBeenCalled();
      }
    );
  });

  describe("when the credential supports status list", () => {
    const statusListValidity = (status: string) =>
      ({
        type: "status_list",
        status,
        rawStatus: RAW_STATUS,
        statusList: { idx: 0, uri: "https://status.example.org" }
      }) as const;

    it("extracts the message from the credentials catalog", () => {
      const credential = buildCredential(statusListValidity("invalid"));

      const { result } = renderStatusMessageHook({
        credential
      });

      expect(result.current).toBe(CATALOG_MESSAGE);
      expect(mockedFromCatalog).toHaveBeenCalledWith(
        expect.objectContaining({
          rawStatus: RAW_STATUS,
          catalogMetadata,
          catalogTranslations
        })
      );
      expect(mockedFromIssuerConf).not.toHaveBeenCalled();
    });

    it("returns undefined without extracting any message when the credential is valid", () => {
      const credential = buildCredential(statusListValidity("valid"));

      const { result } = renderStatusMessageHook({ credential });

      expect(result.current).toBeUndefined();
      expect(mockedFromCatalog).not.toHaveBeenCalled();
      expect(mockedFromIssuerConf).not.toHaveBeenCalled();
    });
  });
});
