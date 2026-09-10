import { assign, setup } from "xstate";

import { ItwSessionExpiredError } from "../../api/client";
import { waitForSessionRefreshActor } from "../utils/actors";
import { handleSessionExpiredAction, storeCredentialAction } from "./actions";
import {
  loadContextActor,
  requestAccessTokenActor,
  upgradeCredentialActor
} from "./actors";
import { Context } from "./context";
import { CredentialUpgradeEvents } from "./events";
import { mapUpgradeEventToFailure } from "./failure";
import { Input } from "./input";
import { Output } from "./output";

/** Defines typed credential-upgrade actors while providers inject runtime side effects. */
export const itwUpgradeSetup = setup({
  types: {
    events: {} as CredentialUpgradeEvents,
    context: {} as Context,
    input: {} as Input,
    output: {} as Output
  },
  actions: {
    storeCredential: storeCredentialAction,
    pickNextCredential: assign({
      credentialIndex: ({ context }) => context.credentialIndex + 1
    }),
    setFailedCredential: assign({
      failedCredentials: ({ context, event }) => {
        const current = context.credentials[context.credentialIndex];

        const failedEvent = mapUpgradeEventToFailure(event);

        const failedCredential = {
          ...current,
          failure: {
            type: failedEvent.type,
            reason: failedEvent.reason
          }
        };

        return [...context.failedCredentials, failedCredential];
      }
    }),
    handleSessionExpired: handleSessionExpiredAction
  },
  actors: {
    requestAccessToken: requestAccessTokenActor,
    loadContext: loadContextActor,
    upgradeCredential: upgradeCredentialActor,
    waitForSessionRefresh: waitForSessionRefreshActor
  },
  guards: {
    isSessionExpired: ({ event }) =>
      "error" in event && event.error instanceof ItwSessionExpiredError,
    hasMoreCredentials: ({ context }) =>
      context.credentialIndex < context.credentials.length - 1
  }
});
