import { DeepPartial } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { GlobalState } from "../../../../../store/reducers/types";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { CredentialsVault } from "../../utils/vault";
import { itwCredentialsVaultMigrationComplete } from "../../store/actions";
import { handleItwCredentialsVaultMigrationSaga } from "../handleItwCredentialsVaultMigrationSaga";

jest.mock("../../utils/vault", () => ({
  CredentialsVault: {
    store: jest.fn()
  }
}));

jest.mock("@sentry/react-native", () => ({
  captureException: jest.fn()
}));

const mockStore = jest.mocked(CredentialsVault.store);

const baseCredential: CredentialMetadata = {
  credentialType: CredentialType.DRIVING_LICENSE,
  credentialId: "dc_sd_jwt_mDL",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "key-1",
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    issuedAt: "2024-09-30T07:32:49.000Z",
    expiration: "2100-09-30T07:32:50.000Z"
  },
  spec_version: "1.0.0"
};

describe("handleItwCredentialsVaultMigrationSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exits early when no legacy credentials are found", () => {
    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          credentials: {
            credentials: {
              [baseCredential.credentialId]: baseCredential
            }
          }
        }
      }
    };

    return expectSaga(handleItwCredentialsVaultMigrationSaga)
      .withState(store)
      .not.put.actionType(itwCredentialsVaultMigrationComplete.toString())
      .run()
      .then(() => {
        expect(mockStore).not.toHaveBeenCalled();
      });
  });

  it("migrates legacy credentials and dispatches completion action on success", () => {
    mockStore.mockResolvedValue(true);

    const legacyEntry = { ...baseCredential, credential: "raw-jwt-string" };

    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          credentials: {
            credentials: {
              [legacyEntry.credentialId]:
                legacyEntry as unknown as CredentialMetadata
            }
          }
        }
      }
    };

    const expectedPayload: Array<CredentialMetadata> = [baseCredential];

    return expectSaga(handleItwCredentialsVaultMigrationSaga)
      .withState(store)
      .put(itwCredentialsVaultMigrationComplete(expectedPayload))
      .run()
      .then(() => {
        expect(mockStore).toHaveBeenCalledTimes(1);
        expect(mockStore).toHaveBeenCalledWith(
          legacyEntry.credentialId,
          "raw-jwt-string"
        );
      });
  });

  it("does not dispatch completion action when vault write returns false", async () => {
    const sentryModule = await import("@sentry/react-native");
    const captureException = jest.mocked(sentryModule.captureException);

    // CredentialsVault.store returns false (not throws) on failure
    mockStore.mockResolvedValue(false);

    const legacyEntry = { ...baseCredential, credential: "raw-jwt-string" };

    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          credentials: {
            credentials: {
              [legacyEntry.credentialId]:
                legacyEntry as unknown as CredentialMetadata
            }
          }
        }
      }
    };

    return expectSaga(handleItwCredentialsVaultMigrationSaga)
      .withState(store)
      .not.put.actionType(itwCredentialsVaultMigrationComplete.toString())
      .run()
      .then(() => {
        expect(captureException).toHaveBeenCalledTimes(1);
      });
  });

  it("dispatches completion action stripping the credential field from payload", () => {
    mockStore.mockResolvedValue(true);

    const legacyEntry = { ...baseCredential, credential: "raw-jwt-string" };

    const store: DeepPartial<GlobalState> = {
      features: {
        itWallet: {
          credentials: {
            credentials: {
              [legacyEntry.credentialId]:
                legacyEntry as unknown as CredentialMetadata
            }
          }
        }
      }
    };

    // The payload must equal baseCredential (no `credential` field)
    return expectSaga(handleItwCredentialsVaultMigrationSaga)
      .withState(store)
      .put(itwCredentialsVaultMigrationComplete([baseCredential]))
      .run();
  });
});
