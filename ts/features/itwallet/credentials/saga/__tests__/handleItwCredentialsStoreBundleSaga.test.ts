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
  CredentialsVault: { store: jest.fn() }
}));

const mockStore = jest.mocked(CredentialsVault.store);

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

  it("stores each credential in vault and dispatches itwCredentialsStore with metadata", () => {
    mockStore.mockResolvedValue(undefined);
    const payload = makeBundle();
    const action = itwCredentialsStoreBundle(payload);

    return expectSaga(handleItwCredentialsStoreBundleSaga, action)
      .put(itwCredentialsStore(payload.map(b => b.metadata)))
      .run()
      .then(() => {
        expect(mockStore).toHaveBeenCalledTimes(1);
        expect(mockStore).toHaveBeenCalledWith(
          payload[0].metadata.credentialId,
          payload[0].credential
        );
      });
  });

  it("does not dispatch itwCredentialsStore if vault throws", () => {
    mockStore.mockRejectedValue(new Error("vault error"));
    const action = itwCredentialsStoreBundle(makeBundle());

    return expectSaga(handleItwCredentialsStoreBundleSaga, action)
      .not.put.actionType(itwCredentialsStore.toString())
      .run();
  });
});
