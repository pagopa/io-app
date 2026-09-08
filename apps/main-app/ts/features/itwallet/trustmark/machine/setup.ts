import { addSeconds, differenceInSeconds, isPast } from "date-fns";
import { assign, fromPromise, setup } from "xstate";

import {
  GetCredentialTrustmarkUrlActorInput,
  GetCredentialTrustmarkUrlActorOutput,
  GetWalletAttestationActorOutput
} from "./actors";
import { Context } from "./context";
import { TrustmarkEvents } from "./events";
import { mapEventToFailure } from "./failure";
import { Input } from "./input";

const notImplemented = () => {
  throw new Error("Not implemented");
};

/**
 * Amount in seconds to wait before retrying
 */
const MAX_BACKOFF_TIME_SECONDS = 180;
const backoffTimeAmounts = [1, 10, 60, MAX_BACKOFF_TIME_SECONDS];

/** Keeps trustmark renewal actors and provider-injected side effects fully typed. */
export const itwTrustmarkMachineSetup = setup({
  types: {
    context: {} as Context,
    input: {} as Input,
    events: {} as TrustmarkEvents
  },
  actions: {
    onInit: notImplemented,
    storeWalletInstanceAttestation: notImplemented,
    handleSessionExpired: notImplemented,
    updateExpirationSeconds: assign(({ context }) => ({
      expirationSeconds: context.expirationDate
        ? differenceInSeconds(context.expirationDate, new Date())
        : undefined
    })),
    resetTrustmark: assign({
      trustmarkUrl: undefined,
      expirationDate: undefined,
      expirationSeconds: undefined
    }),
    incrementAttempts: assign(({ context }) => {
      const attempts = context.attempts ? context.attempts + 1 : 1;
      const backoffTime =
        backoffTimeAmounts[attempts - 1] || MAX_BACKOFF_TIME_SECONDS;
      return {
        attempts,
        nextAttemptAt: addSeconds(new Date(), backoffTime)
      };
    }),
    resetAttempts: assign({
      attempts: undefined,
      nextAttemptAt: undefined
    }),
    setFailure: assign({
      failure: ({ event }) => mapEventToFailure(event)
    }),
    showRetryFailureToast: notImplemented,
    trackTrustmarkFailure: notImplemented
  },
  actors: {
    getWalletAttestationActor:
      fromPromise<GetWalletAttestationActorOutput>(notImplemented),
    getCredentialTrustmarkActor: fromPromise<
      GetCredentialTrustmarkUrlActorOutput,
      GetCredentialTrustmarkUrlActorInput
    >(notImplemented)
  },
  guards: {
    isTrustmarkExpired: ({ context }) =>
      context.expirationDate ? isPast(context.expirationDate) : true,
    isSessionExpired: notImplemented,
    hasValidWalletInstanceAttestation: notImplemented,
    hasBackoffTimePassed: ({ context }) =>
      context.nextAttemptAt ? isPast(context.nextAttemptAt) : true
  }
});
