import { expectSaga } from "redux-saga-test-plan";

import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { CredentialBundle } from "../../../common/utils/itwTypesUtils";
import { trackItwVaultCredentialStoreFailed } from "../../analytics";
import {
  itwCredentialsStore,
  itwCredentialsStoreBundle
} from "../../store/actions";
import { CredentialsVault } from "../../utils/vault";
import { handleItwCredentialsStoreBundleSaga } from "../handleItwCredentialsStoreBundleSaga";

jest.mock("../../utils/vault", () => ({
  CredentialsVault: { storeAll: jest.fn() }
}));
jest.mock("../../analytics", () => ({
  trackItwVaultCredentialStoreFailed: jest.fn()
}));

const mockStoreAll = jest.mocked(CredentialsVault.storeAll);
const mockTrackStoreFailed = jest.mocked(trackItwVaultCredentialStoreFailed);

const makeBundle = (
  overrides: Partial<CredentialBundle> = {}
): ReadonlyArray<CredentialBundle> => [
  {
    credential: "raw-jwt",
    metadata: ItwStoredCredentialsMocks.mdl,
    ...overrides
  }
];

describe("handleItwCredentialsStoreBundleSaga", () => {
  beforeEach(() => jest.clearAllMocks());

  it("stores all credentials in vault and dispatches itwCredentialsStore with metadata", () => {
    mockStoreAll.mockResolvedValue(undefined);
    const payload = makeBundle();
    const action = itwCredentialsStoreBundle(payload, {});

    return expectSaga(handleItwCredentialsStoreBundleSaga, action)
      .put(itwCredentialsStore(payload.map(b => b.metadata)))
      .run()
      .then(() => {
        expect(mockStoreAll).toHaveBeenCalledTimes(1);
        // A non-batch credential is stored under its credentialId.
        expect(mockStoreAll).toHaveBeenCalledWith(
          payload.map(b => ({
            vaultId: b.metadata.credentialId,
            credential: b.credential
          }))
        );
      });
  });

  it("collapses a batch into one metadata with keyTags and stores each copy under its keyTag", () => {
    mockStoreAll.mockResolvedValue(undefined);
    const copies: ReadonlyArray<CredentialBundle> = [
      {
        credential: "raw-jwt-0",
        metadata: { ...ItwStoredCredentialsMocks.mdl, keyTag: "key-0" }
      },
      {
        credential: "raw-jwt-1",
        metadata: { ...ItwStoredCredentialsMocks.mdl, keyTag: "key-1" }
      }
    ];
    const action = itwCredentialsStoreBundle(copies, {});

    return expectSaga(handleItwCredentialsStoreBundleSaga, action)
      .put(
        itwCredentialsStore([
          { ...copies[0].metadata, keyTags: ["key-0", "key-1"] }
        ])
      )
      .run()
      .then(() => {
        // Each batch copy is stored under its own keyTag.
        expect(mockStoreAll).toHaveBeenCalledWith([
          { vaultId: "key-0", credential: "raw-jwt-0" },
          { vaultId: "key-1", credential: "raw-jwt-1" }
        ]);
      });
  });

  it("does not dispatch itwCredentialsStore if vault throws", () => {
    mockStoreAll.mockRejectedValue(new Error("vault error"));
    const payload = makeBundle();
    const action = itwCredentialsStoreBundle(payload, {});

    return expectSaga(handleItwCredentialsStoreBundleSaga, action)
      .not.put.actionType(itwCredentialsStore.toString())
      .run()
      .then(() => {
        expect(mockTrackStoreFailed).toHaveBeenCalledWith({
          credential_ids: payload.map(({ metadata }) => metadata.credentialId),
          reason: "vault error"
        });
      });
  });
});
