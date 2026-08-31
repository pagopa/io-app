import { CredentialType } from "../../../../common/utils/itwMocksUtils";
import { CredentialMetadata } from "../../../../common/utils/itwTypesUtils";
import { itwCredentialsConsumeInstance } from "../../../../credentials/store/actions";
import { createRemoteActionsImplementation } from "../actions";
import { Context, InitialContext } from "../context";

const baseCredential: CredentialMetadata = {
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

const pidCredential: CredentialMetadata = {
  ...baseCredential,
  credentialType: CredentialType.PID,
  credentialId: "dc_sd_jwt_PersonIdentificationData",
  keyTag: "pid-key-tag",
  keyTags: undefined
};

describe("createRemoteActionsImplementation - consumePresentedBatchCredentials", () => {
  const dispatch = jest.fn();

  const makeStore = (credentials: Record<string, CredentialMetadata>) => ({
    getState: jest.fn().mockReturnValue({
      features: {
        itWallet: {
          credentials: { credentials }
        }
      }
    }),
    dispatch
  });

  beforeEach(() => jest.clearAllMocks());

  it("dispatches itwCredentialsConsumeInstance for the presented Proof of Age copy", () => {
    const store = makeStore({
      [baseCredential.credentialId]: baseCredential,
      [pidCredential.credentialId]: pidCredential
    });
    const actions = createRemoteActionsImplementation(
      {} as never,
      store as never
    );

    actions.consumePresentedBatchCredentials({
      context: {
        ...InitialContext,
        presentedKeyTags: ["key-tag-01", "pid-key-tag"]
      } as Context
    } as never);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      itwCredentialsConsumeInstance([
        { credentialId: baseCredential.credentialId, keyTag: "key-tag-01" }
      ])
    );
  });

  it("does not dispatch when the presented credential is not in the batch allow-list (e.g. PID)", () => {
    const store = makeStore({ [pidCredential.credentialId]: pidCredential });
    const actions = createRemoteActionsImplementation(
      {} as never,
      store as never
    );

    actions.consumePresentedBatchCredentials({
      context: {
        ...InitialContext,
        presentedKeyTags: ["pid-key-tag"]
      } as Context
    } as never);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("does not dispatch when no presented keyTag matches a stored credential", () => {
    const store = makeStore({ [baseCredential.credentialId]: baseCredential });
    const actions = createRemoteActionsImplementation(
      {} as never,
      store as never
    );

    actions.consumePresentedBatchCredentials({
      context: {
        ...InitialContext,
        presentedKeyTags: ["unknown-key-tag"]
      } as Context
    } as never);

    expect(dispatch).not.toHaveBeenCalled();
  });

  it("does not dispatch when presentedKeyTags is empty", () => {
    const store = makeStore({ [baseCredential.credentialId]: baseCredential });
    const actions = createRemoteActionsImplementation(
      {} as never,
      store as never
    );

    actions.consumePresentedBatchCredentials({
      context: { ...InitialContext, presentedKeyTags: [] } as Context
    } as never);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
