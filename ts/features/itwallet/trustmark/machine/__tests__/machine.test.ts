import { waitFor } from "@testing-library/react-native";
import {
  assign,
  createActor,
  fromPromise,
  waitFor as waitForActor
} from "xstate";
import { ItwStoredCredentialsMocks } from "../../../common/utils/itwMocksUtils";
import { ItwTags } from "../../../machine/tags";
import {
  GetCredentialTrustmarkUrlActorInput,
  GetCredentialTrustmarkUrlActorOutput,
  GetWalletAttestationActorOutput
} from "../actors";
import { itwTrustmarkMachine } from "../machine";
import { type Context } from "../context";

const onInit = jest.fn();
const storeWalletInstanceAttestation = jest.fn();
const handleSessionExpired = jest.fn();
const showRetryFailureToast = jest.fn();

const getWalletAttestationActor = jest.fn();
const getCredentialTrustmarkActor = jest.fn();

const isSessionExpired = jest.fn();
const hasValidWalletInstanceAttestation = jest.fn();

const mockedMachine = itwTrustmarkMachine.provide({
  actions: {
    onInit: assign(onInit),
    storeWalletInstanceAttestation,
    handleSessionExpired,
    showRetryFailureToast
  },
  actors: {
    getWalletAttestationActor: fromPromise<GetWalletAttestationActorOutput>(
      getWalletAttestationActor
    ),
    getCredentialTrustmarkActor: fromPromise<
      GetCredentialTrustmarkUrlActorOutput,
      GetCredentialTrustmarkUrlActorInput
    >(getCredentialTrustmarkActor)
  },
  guards: {
    isSessionExpired,
    hasValidWalletInstanceAttestation
  }
});

describe("itwTrustmarkMachine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should obtain and refresh a trustmark", async () => {
    jest.setSystemTime(1732099618000);

    onInit.mockImplementation(() => ({
      walletInstanceAttestation: { jwt: "T_WIA" },
      credential: ItwStoredCredentialsMocks.mdl
    }));

    hasValidWalletInstanceAttestation.mockReturnValue(true);

    getCredentialTrustmarkActor.mockImplementation(() =>
      Promise.resolve({
        jwt: "T_JWT",
        expirationTime: 1732099618 + 10,
        url: "T_URL"
      })
    );

    const actor = createActor(mockedMachine, {
      input: { credentialType: "MDL" }
    });

    /**
     * Initial state
     */

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("RefreshingTrustmark");
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      credentialType: "MDL",
      walletInstanceAttestation: { jwt: "T_WIA" },
      credential: ItwStoredCredentialsMocks.mdl
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    /**
     * Start the machine
     */

    actor.start();

    /**
     * Get the trustmark
     */

    await waitForActor(actor, snapshot =>
      snapshot.matches("DisplayingTrustmark")
    );

    await waitFor(() =>
      expect(getCredentialTrustmarkActor).toHaveBeenCalledTimes(1)
    );

    expect(actor.getSnapshot().value).toStrictEqual({
      DisplayingTrustmark: "Idle"
    });
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      credentialType: "MDL",
      walletInstanceAttestation: { jwt: "T_WIA" },
      credential: ItwStoredCredentialsMocks.mdl,
      trustmarkUrl: "T_URL",
      expirationDate: new Date(1732099618000 + 10 * 1000),
      expirationSeconds: 10,
      attempts: undefined,
      nextAttemptAt: undefined
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());

    /**
     * Refresh the trustmark
     */

    jest.advanceTimersByTime(11 * 1000);

    expect(actor.getSnapshot().value).toStrictEqual("RefreshingTrustmark");
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      credentialType: "MDL",
      walletInstanceAttestation: { jwt: "T_WIA" },
      credential: ItwStoredCredentialsMocks.mdl,
      trustmarkUrl: undefined,
      expirationDate: undefined,
      expirationSeconds: undefined,
      attempts: undefined,
      nextAttemptAt: undefined
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    /**
     * From here is a loop between the previous states
     */
  });

  it("should obtain a new WIA if the current one is expired", async () => {
    jest.setSystemTime(1732099618000);

    onInit.mockImplementation(() => ({
      walletInstanceAttestation: { jwt: "T_WIA" },
      credential: ItwStoredCredentialsMocks.mdl
    }));

    getWalletAttestationActor.mockImplementation(() =>
      Promise.resolve({ jwt: "T_WIA_UPDATED" })
    );

    const actor = createActor(mockedMachine, {
      input: { credentialType: "MDL" }
    });

    /**
     * Initial state
     */

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual(
      "ObtainingWalletInstanceAttestation"
    );
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      credentialType: "MDL",
      walletInstanceAttestation: { jwt: "T_WIA" },
      credential: ItwStoredCredentialsMocks.mdl
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    /**
     * Start the machine
     */

    actor.start();

    /**
     * Update the WIA
     */

    await waitFor(() =>
      expect(getWalletAttestationActor).toHaveBeenCalledTimes(1)
    );

    /**
     * Get the trustmark
     */

    await waitForActor(actor, snapshot =>
      snapshot.matches("RefreshingTrustmark")
    );

    expect(actor.getSnapshot().value).toStrictEqual("RefreshingTrustmark");
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      walletInstanceAttestation: { jwt: "T_WIA_UPDATED" },
      credentialType: "MDL",
      credential: ItwStoredCredentialsMocks.mdl
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    /**
     * From here is the same as the previous test
     */
  });

  it("should handle session expired", async () => {
    jest.setSystemTime(1732099618000);

    onInit.mockImplementation(() => ({
      walletInstanceAttestation: { jwt: "T_WIA" },
      credential: ItwStoredCredentialsMocks.mdl
    }));

    isSessionExpired.mockReturnValue(true);

    getWalletAttestationActor.mockImplementation(() =>
      Promise.reject(new Error("Session expired"))
    );

    const actor = createActor(mockedMachine, {
      input: { credentialType: "MDL" }
    });

    /**
     * Initial state
     */

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual(
      "ObtainingWalletInstanceAttestation"
    );
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      credentialType: "MDL",
      walletInstanceAttestation: { jwt: "T_WIA" },
      credential: ItwStoredCredentialsMocks.mdl
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    /**
     * Start the machine
     */

    actor.start();

    /**
     * Update the WIA
     */

    await waitFor(() =>
      expect(getWalletAttestationActor).toHaveBeenCalledTimes(1)
    );

    /**
     * Handle session expired
     */

    expect(handleSessionExpired).toHaveBeenCalledTimes(1);
  });

  it("should handle failure", async () => {
    jest.setSystemTime(1732099618000);

    onInit.mockImplementation(() => ({
      walletInstanceAttestation: { jwt: "T_WIA" },
      credential: ItwStoredCredentialsMocks.mdl
    }));

    hasValidWalletInstanceAttestation.mockReturnValue(true);

    getCredentialTrustmarkActor.mockImplementation(() =>
      Promise.reject("WIA and cryptocontext keys do not match")
    );

    const actor = createActor(mockedMachine, {
      input: { credentialType: "mDL" }
    });

    /**
     * Initial state
     */

    await waitFor(() => expect(onInit).toHaveBeenCalledTimes(1));

    expect(actor.getSnapshot().value).toStrictEqual("RefreshingTrustmark");
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      credentialType: "mDL",
      walletInstanceAttestation: { jwt: "T_WIA" },
      credential: ItwStoredCredentialsMocks.mdl
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set([ItwTags.Loading]));

    /**
     * Start the machine
     */

    actor.start();

    /**
     * Get the trustmark
     */

    await waitForActor(actor, snapshot => snapshot.matches("Failure"));

    await waitFor(() =>
      expect(getCredentialTrustmarkActor).toHaveBeenCalledTimes(1)
    );

    expect(actor.getSnapshot().value).toStrictEqual("Failure");
    expect(actor.getSnapshot().context).toStrictEqual<Context>({
      credentialType: "mDL",
      walletInstanceAttestation: { jwt: "T_WIA" },
      credential: ItwStoredCredentialsMocks.mdl,
      attempts: 1,
      failure: expect.anything(),
      nextAttemptAt: new Date(1732099618000 + 1 * 1000)
    });
    expect(actor.getSnapshot().tags).toStrictEqual(new Set());
  });
});
