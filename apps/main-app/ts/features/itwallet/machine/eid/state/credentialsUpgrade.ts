import { assign } from "xstate";

import { assert } from "../../../../../utils/assert.ts";
import { ItwTags } from "../../tags";
import { itwEidIssuanceMachineSetup } from "../setup";

/** Upgrades eligible wallet credentials after successful electronic identity issuance. */
export const credentialsUpgradeState =
  itwEidIssuanceMachineSetup.createStateConfig({
    description: "This state handles the upgrade of credentials in the wallet",
    initial: "Upgrading",
    states: {
      Upgrading: {
        entry: "navigateToSuccessScreen",
        tags: [ItwTags.Loading],
        invoke: {
          id: "credentialUpgradeMachine",
          src: "credentialUpgradeMachine",
          input: ({ context }) => {
            assert(context.mode, "Issuance mode must be defined");

            return {
              itwVersion: context.itwVersion,
              credentials: context.credentialsToUpgrade,
              issuanceMode: context.mode,
              deps: {
                env: context.deps.env,
                store: context.deps.store
              }
            };
          },
          onDone: {
            description: "Credentials upgrade completed successfully",
            actions: [
              assign(({ event }) => ({
                failedCredentials: event.output.failedCredentials
              })),
              "storeCredentialUpgradeFailures"
            ],
            target: "#itwEidIssuanceMachine.Success"
          },
          onError: {
            description:
              "An unexpected error occurred during the credentials upgrade",
            actions: "setFailure",
            target: "#itwEidIssuanceMachine.Failure"
          }
        }
      }
    }
  } as const);
