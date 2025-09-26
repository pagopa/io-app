import { createActor, fromPromise, waitFor } from "xstate";
import { itwCredentialUpgradeMachine } from "../machine";
import { StoredCredential } from "../../../common/utils/itwTypesUtils";
import { UpgradeCredentialParams, UpgradeCredentialOutput } from "../actors";

const makeCredential = (
  overrides: Partial<StoredCredential> = {}
): StoredCredential => ({
  keyTag: "tag",
  credential: "credential-data",
  format: "format",
  parsedCredential: {} as any,
  credentialType: "TYPE",
  credentialId: "id",
  issuerConf: {} as any,
  jwt: { expiration: new Date().toISOString() },
  ...overrides
});

describe("itwCredentialUpgradeMachine", () => {
  it("should immediately complete if there are no credentials", async () => {
    const mockUpgradeCredential = jest.fn(() =>
      Promise.reject(new Error("should not be called"))
    );
    const mockStoreCredential = jest.fn();

    const machine = itwCredentialUpgradeMachine.provide({
      actors: {
        upgradeCredential: fromPromise<
          UpgradeCredentialOutput,
          UpgradeCredentialParams
        >(mockUpgradeCredential)
      },
      actions: { storeCredential: mockStoreCredential }
    });
    const actor = createActor(machine, {
      input: {
        walletInstanceAttestation: "attestation",
        pid: makeCredential(),
        credentials: [],
        issuanceMode: "upgrade"
      }
    });
    actor.start();

    expect(mockUpgradeCredential).not.toHaveBeenCalled();
    expect(mockStoreCredential).not.toHaveBeenCalled();

    expect(actor.getSnapshot().value).toBe("Completed");
    expect(actor.getSnapshot().output).toEqual({ failedCredentials: [] });
  });

  it("should upgrade credentials one by one and complete", async () => {
    const mockUpgradeCredential = jest.fn(({ input }) =>
      Promise.resolve({
        credentialType: input.credential.credentialType,
        credentials: [input.credential]
      })
    );
    const mockStoreCredential = jest.fn();

    const machine = itwCredentialUpgradeMachine.provide({
      actors: {
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
        walletInstanceAttestation: "attestation",
        pid: makeCredential(),
        credentials,
        issuanceMode: "upgrade"
      }
    });
    actor.start();

    await waitFor(actor, snap => snap.matches("Completed"));

    expect(mockUpgradeCredential).toHaveBeenCalled();
    expect(mockStoreCredential).toHaveBeenCalled();

    expect(actor.getSnapshot().value).toBe("Completed");
    expect(actor.getSnapshot().output).toEqual({ failedCredentials: [] });
  });

  it("should collect failed credentials in output", async () => {
    const mockUpgradeCredential = jest.fn(({ input }) => {
      if (input.credential.credentialType === "fail") {
        return Promise.reject(new Error("fail"));
      }
      return Promise.resolve({
        credentialType: input.credential.credentialType,
        credentials: [input.credential]
      });
    });

    const mockStoreCredential = jest.fn();

    const machine = itwCredentialUpgradeMachine.provide({
      actors: {
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
        walletInstanceAttestation: "attestation",
        pid: makeCredential(),
        credentials,
        issuanceMode: "upgrade"
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
});
