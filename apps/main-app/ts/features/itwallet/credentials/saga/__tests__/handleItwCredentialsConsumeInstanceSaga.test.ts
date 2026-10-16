import * as ioCrypto from "@pagopa/io-react-native-crypto";
import { expectSaga } from "redux-saga-test-plan";

import { walletRemoveCards } from "../../../../wallet/store/actions/cards";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import { trackItwVaultCredentialRemoveFailed } from "../../analytics";
import {
  itwCredentialsBatchRefillRequest,
  itwCredentialsConsumeInstance,
  itwCredentialsRemove,
  itwCredentialsStore
} from "../../store/actions";
import { CredentialsVault } from "../../utils/vault";
import { handleItwCredentialsConsumeInstanceSaga } from "../handleItwCredentialsConsumeInstanceSaga";

jest.mock("../../utils/vault", () => ({
  CredentialsVault: { remove: jest.fn() }
}));
jest.mock("../../analytics", () => ({
  trackItwVaultCredentialRemoveFailed: jest.fn()
}));
jest.mock("@pagopa/io-react-native-crypto", () => ({ deleteKey: jest.fn() }));

const mockVaultRemove = jest.mocked(CredentialsVault.remove);
const mockDeleteKey = jest.mocked(ioCrypto.deleteKey);
const mockTrackRemoveFailed = jest.mocked(trackItwVaultCredentialRemoveFailed);

const batchCredential: CredentialMetadata = {
  credentialType: CredentialType.PROOF_OF_AGE,
  credentialId: "dc_sd_jwt_proof_of_age",
  parsedCredential: {},
  format: "dc+sd-jwt",
  keyTag: "key-tag-01",
  keyTags: ["key-tag-01", "key-tag-02", "key-tag-03"],
  issuerConf: {} as CredentialMetadata["issuerConf"],
  jwt: {
    issuedAt: "2024-01-01T00:00:00.000Z",
    expiration: "2100-01-01T00:00:00.000Z"
  },
  spec_version: "1.3.3"
};

const lastCopyCredential: CredentialMetadata = {
  ...batchCredential,
  keyTag: "key-tag-01",
  keyTags: ["key-tag-01"]
};

const makeState = (credentials: ReadonlyArray<CredentialMetadata>) => ({
  features: {
    itWallet: {
      credentials: {
        credentials: credentials.reduce<Record<string, CredentialMetadata>>(
          (acc, c) => ({ ...acc, [c.credentialId]: c }),
          {}
        )
      }
    }
  }
});

describe("handleItwCredentialsConsumeInstanceSaga", () => {
  beforeEach(() => jest.clearAllMocks());

  it("does nothing when the credentialId is not found in the store", () => {
    const action = itwCredentialsConsumeInstance([
      { credentialId: "unknown", keyTag: "key-tag-01" }
    ]);

    return expectSaga(handleItwCredentialsConsumeInstanceSaga, action)
      .withState(makeState([]))
      .not.put.actionType(itwCredentialsStore.toString())
      .not.put.actionType(itwCredentialsRemove.toString())
      .not.put.actionType(walletRemoveCards.toString())
      .run()
      .then(() => {
        expect(mockVaultRemove).not.toHaveBeenCalled();
        expect(mockDeleteKey).not.toHaveBeenCalled();
      });
  });

  it("decrements the batch and rotates the representative copy when copies remain", () => {
    mockVaultRemove.mockResolvedValue(undefined);
    mockDeleteKey.mockResolvedValue(undefined);

    const action = itwCredentialsConsumeInstance([
      {
        credentialId: batchCredential.credentialId,
        keyTag: "key-tag-01"
      }
    ]);

    return expectSaga(handleItwCredentialsConsumeInstanceSaga, action)
      .withState(makeState([batchCredential]))
      .put(
        itwCredentialsStore([
          {
            ...batchCredential,
            keyTag: "key-tag-02",
            keyTags: ["key-tag-02", "key-tag-03"]
          }
        ])
      )
      .not.put.actionType(itwCredentialsRemove.toString())
      .not.put.actionType(walletRemoveCards.toString())
      .run()
      .then(() => {
        expect(mockVaultRemove).toHaveBeenCalledWith("key-tag-01");
        expect(mockDeleteKey).toHaveBeenCalledWith("key-tag-01");
      });
  });

  it("fully removes the credential and its Wallet card when the last copy is consumed", () => {
    mockVaultRemove.mockResolvedValue(undefined);
    mockDeleteKey.mockResolvedValue(undefined);

    const action = itwCredentialsConsumeInstance([
      {
        credentialId: lastCopyCredential.credentialId,
        keyTag: "key-tag-01"
      }
    ]);

    return expectSaga(handleItwCredentialsConsumeInstanceSaga, action)
      .withState(makeState([lastCopyCredential]))
      .put(itwCredentialsRemove([lastCopyCredential]))
      .put(walletRemoveCards([`ITW_${CredentialType.PROOF_OF_AGE}`]))
      .not.put.actionType(itwCredentialsStore.toString())
      .run()
      .then(() => {
        expect(mockVaultRemove).toHaveBeenCalledWith("key-tag-01");
        expect(mockDeleteKey).toHaveBeenCalledWith("key-tag-01");
      });
  });

  it("tracks vault removal failures as best-effort and skips Redux cleanup for that instance", () => {
    mockVaultRemove.mockRejectedValue(new Error("vault error"));

    const action = itwCredentialsConsumeInstance([
      {
        credentialId: batchCredential.credentialId,
        keyTag: "key-tag-01"
      }
    ]);

    return expectSaga(handleItwCredentialsConsumeInstanceSaga, action)
      .withState(makeState([batchCredential]))
      .not.put.actionType(itwCredentialsStore.toString())
      .not.put.actionType(itwCredentialsRemove.toString())
      .not.put.actionType(walletRemoveCards.toString())
      .run()
      .then(() => {
        expect(mockTrackRemoveFailed).toHaveBeenCalledWith({
          credential_ids: [batchCredential.credentialId],
          reason: "vault error"
        });
        expect(mockDeleteKey).not.toHaveBeenCalled();
      });
  });

  it("requests a batch refill when the consumed copy brings the pool to the threshold", () => {
    mockVaultRemove.mockResolvedValue(undefined);
    mockDeleteKey.mockResolvedValue(undefined);

    const action = itwCredentialsConsumeInstance([
      { credentialId: batchCredential.credentialId, keyTag: "key-tag-01" }
    ]);

    return expectSaga(handleItwCredentialsConsumeInstanceSaga, action)
      .withState(makeState([batchCredential]))
      .put(
        itwCredentialsBatchRefillRequest({
          credentialType: CredentialType.PROOF_OF_AGE,
          trigger: "presentation"
        })
      )
      .run();
  });

  it("does not request a batch refill while the pool stays above the threshold", () => {
    mockVaultRemove.mockResolvedValue(undefined);
    mockDeleteKey.mockResolvedValue(undefined);

    const fullBatchCredential: CredentialMetadata = {
      ...batchCredential,
      keyTags: ["key-tag-01", "key-tag-02", "key-tag-03", "key-tag-04"]
    };

    const action = itwCredentialsConsumeInstance([
      { credentialId: fullBatchCredential.credentialId, keyTag: "key-tag-01" }
    ]);

    return expectSaga(handleItwCredentialsConsumeInstanceSaga, action)
      .withState(makeState([fullBatchCredential]))
      .not.put.actionType(itwCredentialsBatchRefillRequest.toString())
      .run();
  });

  it("does not request a batch refill when the last copy is consumed", () => {
    mockVaultRemove.mockResolvedValue(undefined);
    mockDeleteKey.mockResolvedValue(undefined);

    const action = itwCredentialsConsumeInstance([
      { credentialId: lastCopyCredential.credentialId, keyTag: "key-tag-01" }
    ]);

    return expectSaga(handleItwCredentialsConsumeInstanceSaga, action)
      .withState(makeState([lastCopyCredential]))
      .not.put.actionType(itwCredentialsBatchRefillRequest.toString())
      .run();
  });

  it("keeps processing the remaining instances after a failure", () => {
    mockVaultRemove
      .mockRejectedValueOnce(new Error("vault error"))
      .mockResolvedValue(undefined);
    mockDeleteKey.mockResolvedValue(undefined);

    const otherCredential: CredentialMetadata = {
      ...batchCredential,
      credentialId: "dc_sd_jwt_other",
      keyTag: "key-tag-11",
      keyTags: ["key-tag-11", "key-tag-12"]
    };

    const action = itwCredentialsConsumeInstance([
      { credentialId: batchCredential.credentialId, keyTag: "key-tag-01" },
      { credentialId: otherCredential.credentialId, keyTag: "key-tag-11" }
    ]);

    return expectSaga(handleItwCredentialsConsumeInstanceSaga, action)
      .withState(makeState([batchCredential, otherCredential]))
      .put(
        itwCredentialsStore([
          {
            ...otherCredential,
            keyTag: "key-tag-12",
            keyTags: ["key-tag-12"]
          }
        ])
      )
      .run()
      .then(() => {
        expect(mockTrackRemoveFailed).toHaveBeenCalledTimes(1);
        expect(mockVaultRemove).toHaveBeenCalledTimes(2);
      });
  });
});
