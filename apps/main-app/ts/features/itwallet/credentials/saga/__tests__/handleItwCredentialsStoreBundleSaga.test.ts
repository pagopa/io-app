import { type CredentialStatus } from "@pagopa/io-react-native-wallet";
import { expectSaga } from "redux-saga-test-plan";

import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { CredentialBundle } from "../../../common/utils/itwTypesUtils";
import { StatusListRepository } from "../../../statusList/utils/repository";
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
jest.mock("../../../statusList/utils/repository", () => ({
  StatusListRepository: { upsertMany: jest.fn() }
}));

const mockStoreAll = jest.mocked(CredentialsVault.storeAll);
const mockTrackStoreFailed = jest.mocked(trackItwVaultCredentialStoreFailed);
const mockStatusListUpsertMany = jest.mocked(StatusListRepository.upsertMany);

const makeBundle = (
  overrides: Partial<CredentialBundle> = {}
): ReadonlyArray<CredentialBundle> => [
  {
    credential: "raw-jwt",
    metadata: ItwStoredCredentialsMocks.mdl,
    ...overrides
  }
];

const makeStatusList = (id: number): CredentialStatus.StatusList => ({
  sub: `https://issuer.example/status/${id}`,
  iat: 1690000000,
  exp: 1700000000,
  status_list: { bits: 1, lst: "raw-list" }
});

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
        // No status list in the bundles
        expect(mockStatusListUpsertMany).toHaveBeenCalledWith([]);
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

  it("calls StatusListRepository with the array of status lists contained in the credential bundles", () => {
    mockStoreAll.mockResolvedValue(undefined);
    mockStatusListUpsertMany.mockResolvedValue(undefined);

    const statusList1 = makeStatusList(1);
    const statusList2 = makeStatusList(2);
    const bundles: ReadonlyArray<CredentialBundle> = [
      {
        credential: "raw-jwt-0",
        metadata: ItwStoredCredentialsMocks.mdl,
        statusList: { uri: statusList1.sub, payload: statusList1 }
      },
      {
        credential: "raw-jwt-1",
        metadata: ItwStoredCredentialsMocks.ts,
        statusList: { uri: statusList2.sub, payload: statusList2 }
      }
    ];
    const action = itwCredentialsStoreBundle(bundles, {});

    return expectSaga(handleItwCredentialsStoreBundleSaga, action)
      .put(itwCredentialsStore(bundles.map(b => b.metadata)))
      .run()
      .then(() => {
        expect(mockStatusListUpsertMany).toHaveBeenCalledWith([
          [statusList1.sub, statusList1],
          [statusList2.sub, statusList2]
        ]);
      });
  });

  it("deduplicates the status lists of multiple credentials sharing the same URI", () => {
    mockStoreAll.mockResolvedValue(undefined);
    mockStatusListUpsertMany.mockResolvedValue(undefined);

    const statusList = makeStatusList(1);
    const bundles: ReadonlyArray<CredentialBundle> = [
      {
        credential: "raw-jwt-0",
        metadata: ItwStoredCredentialsMocks.mdl,
        statusList: { uri: statusList.sub, payload: statusList }
      },
      {
        credential: "raw-jwt-1",
        metadata: ItwStoredCredentialsMocks.ts,
        statusList: { uri: statusList.sub, payload: statusList }
      }
    ];
    const action = itwCredentialsStoreBundle(bundles, {});

    return expectSaga(handleItwCredentialsStoreBundleSaga, action)
      .put(itwCredentialsStore(bundles.map(b => b.metadata)))
      .run()
      .then(() => {
        expect(mockStatusListUpsertMany).toHaveBeenCalledWith([
          [statusList.sub, statusList]
        ]);
      });
  });
});
