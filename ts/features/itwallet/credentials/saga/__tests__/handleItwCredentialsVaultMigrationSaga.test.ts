import { DeepPartial } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { GlobalState } from "../../../../../store/reducers/types";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import {
  trackItwVaultMigrationFailed,
  trackItwVaultMigrationRequest,
  trackItwVaultMigrationSuccess
} from "../../analytics";
import { CredentialsVault } from "../../utils/vault";
import { itwCredentialsVaultMigrationComplete } from "../../store/actions";
import { handleItwCredentialsVaultMigrationSaga } from "../handleItwCredentialsVaultMigrationSaga";

jest.mock("../../utils/vault", () => ({
  CredentialsVault: {
    store: jest.fn()
  }
}));
jest.mock("../../analytics", () => ({
  trackItwVaultMigrationFailed: jest.fn(),
  trackItwVaultMigrationRequest: jest.fn(),
  trackItwVaultMigrationSuccess: jest.fn()
}));

const mockStore = jest.mocked(CredentialsVault.store);
const mockTrackMigrationFailed = jest.mocked(trackItwVaultMigrationFailed);
const mockTrackMigrationRequest = jest.mocked(trackItwVaultMigrationRequest);
const mockTrackMigrationSuccess = jest.mocked(trackItwVaultMigrationSuccess);

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

const makeState = (
  legacyCredentials: Record<
    string,
    CredentialMetadata & { credential: string }
  >,
  isMixpanelEnabled: boolean | null = true
): DeepPartial<GlobalState> => ({
  persistedPreferences: {
    isMixpanelEnabled
  },
  features: {
    itWallet: {
      credentials: {
        legacyCredentials
      }
    }
  }
});

describe("handleItwCredentialsVaultMigrationSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exits early when no legacy credentials are found", () => {
    const store: DeepPartial<GlobalState> = {
      persistedPreferences: {
        isMixpanelEnabled: true
      },
      features: {
        itWallet: {
          credentials: {
            legacyCredentials: {}
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
        expect(mockTrackMigrationRequest).not.toHaveBeenCalled();
        expect(mockTrackMigrationFailed).not.toHaveBeenCalled();
        expect(mockTrackMigrationSuccess).not.toHaveBeenCalled();
      });
  });

  it("migrates legacy credentials and dispatches completion action on success", () => {
    mockStore.mockResolvedValue();

    const legacyEntry = { ...baseCredential, credential: "raw-jwt-string" };

    return expectSaga(handleItwCredentialsVaultMigrationSaga)
      .withState(makeState({ [legacyEntry.credentialId]: legacyEntry }))
      .put(itwCredentialsVaultMigrationComplete([legacyEntry.credentialId]))
      .run()
      .then(() => {
        expect(mockStore).toHaveBeenCalledTimes(1);
        expect(mockStore).toHaveBeenCalledWith(
          legacyEntry.credentialId,
          "raw-jwt-string"
        );
        expect(mockTrackMigrationRequest).toHaveBeenCalledWith(true);
        expect(mockTrackMigrationSuccess).toHaveBeenCalledWith(true);
        expect(mockTrackMigrationFailed).not.toHaveBeenCalled();
      });
  });

  it("does not dispatch completion action when vault write throws", () => {
    mockStore.mockRejectedValue(new Error("Storage error"));

    const legacyEntry = { ...baseCredential, credential: "raw-jwt-string" };

    return expectSaga(handleItwCredentialsVaultMigrationSaga)
      .withState(makeState({ [legacyEntry.credentialId]: legacyEntry }))
      .not.put.actionType(itwCredentialsVaultMigrationComplete.toString())
      .run()
      .then(() => {
        expect(mockTrackMigrationRequest).toHaveBeenCalledWith(true);
        expect(mockTrackMigrationSuccess).not.toHaveBeenCalled();
        expect(mockTrackMigrationFailed).toHaveBeenCalledWith(
          {
            credential_ids: [legacyEntry.credentialId],
            reason: "Storage error"
          },
          true
        );
      });
  });

  it("dispatches completion with only succeeded IDs on partial failure", () => {
    const successEntry = { ...baseCredential, credential: "raw-jwt-success" };
    const failEntry: typeof successEntry = {
      ...baseCredential,
      credentialId: "dc_sd_jwt_mDL_fail",
      credential: "raw-jwt-fail"
    };

    // First call succeeds, second fails
    mockStore
      .mockResolvedValueOnce()
      .mockRejectedValueOnce(new Error("Storage error"));

    return expectSaga(handleItwCredentialsVaultMigrationSaga)
      .withState(
        makeState({
          [successEntry.credentialId]: successEntry,
          [failEntry.credentialId]: failEntry
        })
      )
      .put(itwCredentialsVaultMigrationComplete([successEntry.credentialId]))
      .run()
      .then(() => {
        expect(mockTrackMigrationRequest).toHaveBeenCalledWith(true);
        expect(mockTrackMigrationSuccess).not.toHaveBeenCalled();
        expect(mockTrackMigrationFailed).toHaveBeenCalledWith(
          {
            credential_ids: [failEntry.credentialId],
            reason: "Storage error"
          },
          true
        );
      });
  });
});
