import * as ioCrypto from "@pagopa/io-react-native-crypto";
import { expectSaga } from "redux-saga-test-plan";

import { walletRemoveCards } from "../../../../wallet/store/actions/cards";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { trackItwVaultCredentialRemoveFailed } from "../../analytics";
import {
  itwCredentialsRemove,
  itwCredentialsRemoveByType
} from "../../store/actions";
import { CredentialsVault } from "../../utils/vault";
import { handleItwCredentialsRemoveByTypeSaga } from "../handleItwCredentialsRemoveByTypeSaga";

jest.mock("../../utils/vault", () => ({
  CredentialsVault: { removeAll: jest.fn() }
}));
jest.mock("../../analytics", () => ({
  trackItwVaultCredentialRemoveFailed: jest.fn()
}));
jest.mock("@pagopa/io-react-native-crypto", () => ({ deleteKey: jest.fn() }));

const mockRemoveAll = jest.mocked(CredentialsVault.removeAll);
const mockDeleteKey = jest.mocked(ioCrypto.deleteKey);
const mockTrackRemoveFailed = jest.mocked(trackItwVaultCredentialRemoveFailed);

const baseCredential: CredentialMetadata = {
  credentialType: CredentialType.DRIVING_LICENSE,
  credentialId: "dc_sd_jwt_mDL",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "key-1",
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    issuedAt: "2024-01-01T00:00:00.000Z",
    expiration: "2100-01-01T00:00:00.000Z"
  },
  spec_version: "1.0.0"
};

const makeState = (credentials: Record<string, CredentialMetadata>) => ({
  features: {
    itWallet: {
      credentials: {
        credentials: Object.values(credentials).reduce<
          Record<string, CredentialMetadata>
        >((acc, c) => ({ ...acc, [c.credentialId]: c }), {})
      }
    }
  }
});

describe("handleItwCredentialsRemoveByTypeSaga", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does nothing when no credentials of that type exist", () => {
    const action = itwCredentialsRemoveByType(
      CredentialType.DRIVING_LICENSE,
      {}
    );

    return expectSaga(handleItwCredentialsRemoveByTypeSaga, action)
      .withState(makeState({}))
      .not.put.actionType(itwCredentialsRemove.toString())
      .not.put.actionType(walletRemoveCards.toString())
      .run()
      .then(() => {
        expect(mockRemoveAll).not.toHaveBeenCalled();
        expect(mockDeleteKey).not.toHaveBeenCalled();
      });
  });

  it("removes from vault, dispatches removes, deletes crypto keys", () => {
    mockRemoveAll.mockResolvedValue(undefined);
    mockDeleteKey.mockResolvedValue(undefined);
    const credential = { ...baseCredential };
    const action = itwCredentialsRemoveByType(
      CredentialType.DRIVING_LICENSE,
      {}
    );

    return expectSaga(handleItwCredentialsRemoveByTypeSaga, action)
      .withState(makeState({ [credential.credentialId]: credential }))
      .put(itwCredentialsRemove([credential]))
      .put(walletRemoveCards([`ITW_${CredentialType.DRIVING_LICENSE}`]))
      .run()
      .then(() => {
        expect(mockRemoveAll).toHaveBeenCalledWith([credential.credentialId]);
        expect(mockDeleteKey).toHaveBeenCalledWith(credential.keyTag);
      });
  });

  it("tracks vault removal failures and skips Redux cleanup", () => {
    mockRemoveAll.mockRejectedValue(new Error("vault error"));
    const credential = { ...baseCredential };
    const action = itwCredentialsRemoveByType(
      CredentialType.DRIVING_LICENSE,
      {}
    );

    return expectSaga(handleItwCredentialsRemoveByTypeSaga, action)
      .withState(makeState({ [credential.credentialId]: credential }))
      .not.put.actionType(itwCredentialsRemove.toString())
      .not.put.actionType(walletRemoveCards.toString())
      .run()
      .then(() => {
        expect(mockTrackRemoveFailed).toHaveBeenCalledWith({
          credential_ids: [credential.credentialId],
          reason: "vault error"
        }); // tracks credentialIds, not vault ids
        expect(mockDeleteKey).not.toHaveBeenCalled();
      });
  });
});
