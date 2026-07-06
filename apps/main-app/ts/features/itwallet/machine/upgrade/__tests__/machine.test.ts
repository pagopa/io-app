import { createActor, fromCallback, fromPromise, waitFor } from "xstate";
import { itwCredentialUpgradeMachine } from "../machine";
import { CredentialMetadata } from "../../../common/utils/itwTypesUtils";
import {
  LoadContextOutput,
  UpgradeCredentialParams,
  UpgradeCredentialOutput,
  RequestAccessTokenOutput,
  RequestAccessTokenParams
} from "../actors";
import { ItwSessionExpiredError } from "../../../api/client";

const mockLoadContext = jest.fn(() => Promise.resolve({} as LoadContextOutput));

const makeCredential = (
  overrides: Partial<CredentialMetadata> = {}
): CredentialMetadata => ({
  keyTag: "tag",
  format: "format",
  parsedCredential: {} as any,
  credentialType: "TYPE",
  credentialId: "id",
  issuerConf: {} as any,
  jwt: { expiration: new Date().toISOString() },
  spec_version: "1.0.0",
  ...overrides
});

const makeUpgradeOutput = (
  credential: CredentialMetadata
): UpgradeCredentialOutput => ({
  credentialType: credential.credentialType,
  credentials: [{ credential: "raw-jwt", metadata: credential }],
  walletUnitAttestations: { wua1: "wua-jwt" }
});

describe("itwCredentialUpgradeMachine", () => {
  it("should immediately complete if there are no credentials", async () => {
    const mockRequestAccessToken = jest.fn();
    const mockUpgradeCredential = jest.fn(() =>
      Promise.reject(new Error("should not be called"))
    );
    const mockStoreCredential = jest.fn();

    const machine = itwCredentialUpgradeMachine.provide({
      actors: {
        requestAccessToken: fromPromise<
          RequestAccessTokenOutput,
          RequestAccessTokenParams
        >(mockRequestAccessToken),
        loadContext: fromPromise<LoadContextOutput>(mockLoadContext),
        upgradeCredential: fromPromise<
          UpgradeCredentialOutput,
          UpgradeCredentialParams
        >(mockUpgradeCredential)
      },
      actions: { storeCredential: mockStoreCredential }
    });
    const actor = createActor(machine, {
      input: {
        credentials: [],
        issuanceMode: "upgrade",
        itwVersion: "1.3.3"
      }
    });
    actor.start();

    await waitFor(actor, snap => snap.matches("Completed"));

    expect(mockUpgradeCredential).not.toHaveBeenCalled();
    expect(mockStoreCredential).not.toHaveBeenCalled();

    expect(actor.getSnapshot().value).toBe("Completed");
    expect(actor.getSnapshot().output).toEqual({ failedCredentials: [] });
  });

  it("should upgrade credentials one by one and complete", async () => {
    const mockRequestAccessToken = jest.fn();
    const mockUpgradeCredential = jest.fn(({ input }) =>
      Promise.resolve(makeUpgradeOutput(input.credential))
    );
    const mockStoreCredential = jest.fn();

    const machine = itwCredentialUpgradeMachine.provide({
      actors: {
        requestAccessToken: fromPromise<
          RequestAccessTokenOutput,
          RequestAccessTokenParams
        >(mockRequestAccessToken),
        loadContext: fromPromise<LoadContextOutput>(mockLoadContext),
        upgradeCredential: fromPromise<
          UpgradeCredentialOutput,
          UpgradeCredentialParams
        >(mockUpgradeCredential)
      },
      actions: { storeCredential: mockStoreCredential }
    });

    const credentials = [
      makeCredential({ credentialType: "A" }),
      makeCredential({ credentialType: "B" })
    ];

    const actor = createActor(machine, {
      input: {
        credentials,
        issuanceMode: "upgrade",
        itwVersion: "1.3.3"
      }
    });
    actor.start();

    await waitFor(actor, snap => snap.matches("Completed"));

    expect(mockUpgradeCredential).toHaveBeenCalledTimes(2);
    expect(mockStoreCredential).toHaveBeenCalledTimes(2);

    expect(actor.getSnapshot().value).toBe("Completed");
    expect(actor.getSnapshot().output).toEqual({ failedCredentials: [] });
  });

  it("should collect failed credentials in output", async () => {
    const mockRequestAccessToken = jest.fn();
    const mockUpgradeCredential = jest.fn(({ input }) => {
      if (input.credential.credentialType === "fail") {
        return Promise.reject(new Error("fail"));
      }
      return Promise.resolve(makeUpgradeOutput(input.credential));
    });

    const mockStoreCredential = jest.fn();

    const machine = itwCredentialUpgradeMachine.provide({
      actors: {
        requestAccessToken: fromPromise<
          RequestAccessTokenOutput,
          RequestAccessTokenParams
        >(mockRequestAccessToken),
        loadContext: fromPromise<LoadContextOutput>(mockLoadContext),
        upgradeCredential: fromPromise<
          UpgradeCredentialOutput,
          UpgradeCredentialParams
        >(mockUpgradeCredential)
      },
      actions: { storeCredential: mockStoreCredential }
    });
    const credentials = [
      makeCredential({ credentialType: "ok" }),
      makeCredential({ credentialType: "fail" })
    ];
    const actor = createActor(machine, {
      input: {
        credentials,
        issuanceMode: "upgrade",
        itwVersion: "1.3.3"
      }
    });
    actor.start();

    await waitFor(actor, snap => snap.matches("Completed"));

    expect(mockUpgradeCredential).toHaveBeenCalledTimes(2);
    expect(mockStoreCredential).toHaveBeenCalledTimes(1);

    expect(actor.getSnapshot().value).toBe("Completed");
    expect(actor.getSnapshot().output?.failedCredentials).toEqual([
      expect.objectContaining({ credentialType: "fail" })
    ]);
  });

  it("Should wait for session refresh then retry the credentials upgrade", async () => {
    const mockRequestAccessToken = jest.fn();
    const waitForSessionRefresh = jest.fn();
    const handleSessionExpired = jest.fn();
    const mockUpgradeCredential = jest
      .fn()
      .mockRejectedValueOnce(new ItwSessionExpiredError());
    mockUpgradeCredential.mockImplementation(({ input }) =>
      Promise.resolve(makeUpgradeOutput(input.credential))
    );
    const mockStoreCredential = jest.fn();

    const machine = itwCredentialUpgradeMachine.provide({
      actors: {
        requestAccessToken: fromPromise<
          RequestAccessTokenOutput,
          RequestAccessTokenParams
        >(mockRequestAccessToken),
        loadContext: fromPromise<LoadContextOutput>(mockLoadContext),
        upgradeCredential: fromPromise<
          UpgradeCredentialOutput,
          UpgradeCredentialParams
        >(mockUpgradeCredential),
        waitForSessionRefresh: fromCallback(waitForSessionRefresh)
      },
      actions: { storeCredential: mockStoreCredential, handleSessionExpired }
    });

    const credentials = [
      makeCredential({ credentialType: "expire-then-ok" }),
      makeCredential({ credentialType: "ok" })
    ];

    const actor = createActor(machine, {
      input: {
        credentials,
        issuanceMode: "upgrade",
        itwVersion: "1.3.3"
      }
    });
    actor.start();

    await waitFor(actor, snap => snap.matches("WaitingForSessionRefresh"));
    expect(handleSessionExpired).toHaveBeenCalledTimes(1);

    actor.send({ type: "session-refresh-complete" });

    await waitFor(actor, snap => snap.matches("Completed"));

    expect(mockUpgradeCredential).toHaveBeenCalledTimes(3); // 1 failed for session expired + 2 successful
    expect(mockStoreCredential).toHaveBeenCalledTimes(2);

    expect(actor.getSnapshot().value).toBe("Completed");
    expect(actor.getSnapshot().output).toEqual({ failedCredentials: [] });
  });
});
