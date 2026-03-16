import * as ioCrypto from "@pagopa/io-react-native-crypto";
import { DeepPartial } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { GlobalState } from "../../../../../store/reducers/types";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { CredentialsVault } from "../../utils/vault";
import { itwCredentialsRemove } from "../../store/actions";
import { handleItwCredentialsVaultCoherenceSaga } from "../handleItwCredentialsVaultCoherenceSaga";

jest.mock("../../utils/vault", () => ({
  CredentialsVault: {
    list: jest.fn(),
    removeAll: jest.fn()
  }
}));

jest.mock("@pagopa/io-react-native-crypto", () => ({
  deleteKey: jest.fn()
}));

const mockList = jest.mocked(CredentialsVault.list);
const mockRemoveAll = jest.mocked(CredentialsVault.removeAll);
const mockDeleteKey = jest.mocked(ioCrypto.deleteKey);

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
  credentials: Record<string, CredentialMetadata>,
  legacyCredentials: Record<
    string,
    CredentialMetadata & { credential: string }
  > = {}
): DeepPartial<GlobalState> => ({
  features: {
    itWallet: {
      credentials: {
        credentials,
        legacyCredentials
      }
    }
  }
});

describe("handleItwCredentialsVaultCoherenceSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does nothing when Redux and vault are in sync", () => {
    const credential = { ...baseCredential };
    mockList.mockResolvedValue([credential.credentialId]);

    return expectSaga(handleItwCredentialsVaultCoherenceSaga)
      .withState(makeState({ [credential.credentialId]: credential }))
      .not.put.actionType(itwCredentialsRemove.toString())
      .run()
      .then(() => {
        expect(mockRemoveAll).not.toHaveBeenCalled();
        expect(mockDeleteKey).not.toHaveBeenCalled();
      });
  });

  it("removes credential from Redux and deletes crypto key when missing from vault", () => {
    const credential = { ...baseCredential };
    mockList.mockResolvedValue([]);

    return expectSaga(handleItwCredentialsVaultCoherenceSaga)
      .withState(makeState({ [credential.credentialId]: credential }))
      .put(itwCredentialsRemove([credential]))
      .run()
      .then(() => {
        expect(mockDeleteKey).toHaveBeenCalledWith(credential.keyTag);
        expect(mockRemoveAll).not.toHaveBeenCalled();
      });
  });

  it("removes orphaned vault entries when missing from Redux", () => {
    mockList.mockResolvedValue(["orphan_id"]);

    return expectSaga(handleItwCredentialsVaultCoherenceSaga)
      .withState(makeState({}))
      .not.put.actionType(itwCredentialsRemove.toString())
      .run()
      .then(() => {
        expect(mockRemoveAll).toHaveBeenCalledWith(["orphan_id"]);
        expect(mockDeleteKey).not.toHaveBeenCalled();
      });
  });

  it("handles both mismatches simultaneously", () => {
    const credential = { ...baseCredential };
    mockList.mockResolvedValue(["orphan_id"]);

    return expectSaga(handleItwCredentialsVaultCoherenceSaga)
      .withState(makeState({ [credential.credentialId]: credential }))
      .put(itwCredentialsRemove([credential]))
      .run()
      .then(() => {
        expect(mockDeleteKey).toHaveBeenCalledWith(credential.keyTag);
        expect(mockRemoveAll).toHaveBeenCalledWith(["orphan_id"]);
      });
  });

  it("skips credentials with a pending legacy migration entry", () => {
    const credential = { ...baseCredential };
    const legacyEntry = {
      ...credential,
      credential: "raw-jwt-string"
    };
    mockList.mockResolvedValue([]);

    return expectSaga(handleItwCredentialsVaultCoherenceSaga)
      .withState(
        makeState(
          { [credential.credentialId]: credential },
          { [credential.credentialId]: legacyEntry }
        )
      )
      .not.put.actionType(itwCredentialsRemove.toString())
      .run()
      .then(() => {
        expect(mockDeleteKey).not.toHaveBeenCalled();
      });
  });

  it("removes only non-legacy credentials when some have pending migration", () => {
    const pendingCredential = { ...baseCredential };
    const orphanedCredential: CredentialMetadata = {
      ...baseCredential,
      credentialType: CredentialType.EUROPEAN_HEALTH_INSURANCE_CARD,
      credentialId: "dc_sd_jwt_EuropeanHealthInsuranceCard",
      keyTag: "key-2"
    };
    mockList.mockResolvedValue([]);

    return expectSaga(handleItwCredentialsVaultCoherenceSaga)
      .withState(
        makeState(
          {
            [pendingCredential.credentialId]: pendingCredential,
            [orphanedCredential.credentialId]: orphanedCredential
          },
          {
            [pendingCredential.credentialId]: {
              ...pendingCredential,
              credential: "raw-jwt"
            }
          }
        )
      )
      .put(itwCredentialsRemove([orphanedCredential]))
      .run()
      .then(() => {
        expect(mockDeleteKey).toHaveBeenCalledTimes(1);
        expect(mockDeleteKey).toHaveBeenCalledWith(orphanedCredential.keyTag);
      });
  });

  it("does nothing when both Redux and vault are empty", () => {
    mockList.mockResolvedValue([]);

    return expectSaga(handleItwCredentialsVaultCoherenceSaga)
      .withState(makeState({}))
      .not.put.actionType(itwCredentialsRemove.toString())
      .run()
      .then(() => {
        expect(mockRemoveAll).not.toHaveBeenCalled();
        expect(mockDeleteKey).not.toHaveBeenCalled();
      });
  });
});
