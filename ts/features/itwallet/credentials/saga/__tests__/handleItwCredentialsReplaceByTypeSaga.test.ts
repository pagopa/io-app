import * as ioCrypto from "@pagopa/io-react-native-crypto";
import { DeepPartial } from "redux";
import { expectSaga } from "redux-saga-test-plan";
import { GlobalState } from "../../../../../store/reducers/types";
import { walletRemoveCards } from "../../../../wallet/store/actions/cards";
import { CredentialType } from "../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import {
  itwCredentialsRemove,
  itwCredentialsReplaceByType,
  itwCredentialsStore
} from "../../store/actions";
import { CredentialsVault } from "../../utils/vault";
import { handleItwCredentialsReplaceByTypeSaga } from "../handleItwCredentialsReplaceByTypeSaga";

jest.mock("../../utils/vault", () => ({
  CredentialsVault: { removeAll: jest.fn(), storeAll: jest.fn() }
}));
jest.mock("@pagopa/io-react-native-crypto", () => ({ deleteKey: jest.fn() }));

const mockRemoveAll = jest.mocked(CredentialsVault.removeAll);
const mockStoreAll = jest.mocked(CredentialsVault.storeAll);
const mockDeleteKey = jest.mocked(ioCrypto.deleteKey);

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

const newMetadata: CredentialMetadata = {
  ...baseCredential,
  credentialId: "dc_sd_jwt_mDL_new",
  keyTag: "key-2"
};

const makeState = (
  credentials: Record<string, CredentialMetadata>
): DeepPartial<GlobalState> => ({
  features: {
    itWallet: {
      credentials: { credentials }
    }
  }
});

describe("handleItwCredentialsReplaceByTypeSaga", () => {
  beforeEach(() => jest.clearAllMocks());

  it("removes old credentials then stores new ones", () => {
    mockRemoveAll.mockResolvedValue(undefined);
    mockStoreAll.mockResolvedValue(undefined);
    mockDeleteKey.mockResolvedValue(undefined);

    const action = itwCredentialsReplaceByType(
      [{ credential: "raw-jwt", metadata: newMetadata }],
      {}
    );

    return expectSaga(handleItwCredentialsReplaceByTypeSaga, action)
      .withState(makeState({ [baseCredential.credentialId]: baseCredential }))
      .put(itwCredentialsRemove([baseCredential]))
      .put(walletRemoveCards([`ITW_${CredentialType.DRIVING_LICENSE}`]))
      .put(itwCredentialsStore([newMetadata]))
      .run()
      .then(() => {
        expect(mockRemoveAll).toHaveBeenCalledWith([
          baseCredential.credentialId
        ]);
        expect(mockDeleteKey).toHaveBeenCalledWith(baseCredential.keyTag);
        expect(mockStoreAll).toHaveBeenCalledWith([
          { credentialId: newMetadata.credentialId, credential: "raw-jwt" }
        ]);
      });
  });

  it("only stores when no existing credentials of that type", () => {
    mockStoreAll.mockResolvedValue(undefined);

    const action = itwCredentialsReplaceByType(
      [{ credential: "raw-jwt", metadata: newMetadata }],
      {}
    );

    return expectSaga(handleItwCredentialsReplaceByTypeSaga, action)
      .withState(makeState({}))
      .not.put.actionType(itwCredentialsRemove.toString())
      .not.put.actionType(walletRemoveCards.toString())
      .put(itwCredentialsStore([newMetadata]))
      .run()
      .then(() => {
        expect(mockRemoveAll).not.toHaveBeenCalled();
        expect(mockStoreAll).toHaveBeenCalledTimes(1);
      });
  });

  it("still stores when vault removeAll throws", () => {
    mockRemoveAll.mockRejectedValue(new Error("vault failure"));
    mockStoreAll.mockResolvedValue(undefined);

    const action = itwCredentialsReplaceByType(
      [{ credential: "raw-jwt", metadata: newMetadata }],
      {}
    );

    return expectSaga(handleItwCredentialsReplaceByTypeSaga, action)
      .withState(makeState({ [baseCredential.credentialId]: baseCredential }))
      .not.put.actionType(itwCredentialsRemove.toString())
      .put(itwCredentialsStore([newMetadata]))
      .run()
      .then(() => {
        expect(mockStoreAll).toHaveBeenCalledTimes(1);
      });
  });

  it("does not dispatch itwCredentialsStore when vault storeAll throws", () => {
    mockRemoveAll.mockResolvedValue(undefined);
    mockStoreAll.mockRejectedValue(new Error("store failure"));
    mockDeleteKey.mockResolvedValue(undefined);

    const action = itwCredentialsReplaceByType(
      [{ credential: "raw-jwt", metadata: newMetadata }],
      {}
    );

    return expectSaga(handleItwCredentialsReplaceByTypeSaga, action)
      .withState(makeState({ [baseCredential.credentialId]: baseCredential }))
      .put(itwCredentialsRemove([baseCredential]))
      .not.put.actionType(itwCredentialsStore.toString())
      .run();
  });
});
