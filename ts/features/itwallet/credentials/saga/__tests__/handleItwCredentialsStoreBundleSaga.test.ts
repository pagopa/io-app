import { expectSaga } from "redux-saga-test-plan";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { CredentialBundle } from "../../../common/utils/itwTypesUtils";
import {
  itwCredentialsStore,
  itwCredentialsStoreBundle
} from "../../store/actions";
import { CredentialsVault } from "../../utils/vault";
import { handleItwCredentialsStoreBundleSaga } from "../handleItwCredentialsStoreBundleSaga";

jest.mock("../../utils/vault", () => ({
  CredentialsVault: { storeAll: jest.fn() }
}));

const mockStoreAll = jest.mocked(CredentialsVault.storeAll);

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
        expect(mockStoreAll).toHaveBeenCalledWith(
          payload.map(b => ({
            credentialId: b.metadata.credentialId,
            credential: b.credential
          }))
        );
      });
  });

  it("does not dispatch itwCredentialsStore if vault throws", () => {
    mockStoreAll.mockRejectedValue(new Error("vault error"));
    const action = itwCredentialsStoreBundle(makeBundle(), {});

    return expectSaga(handleItwCredentialsStoreBundleSaga, action)
      .not.put.actionType(itwCredentialsStore.toString())
      .run();
  });
});
