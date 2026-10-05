import { itwTrustmarkMachineSetup } from "../setup";

const TRUSTMARK_EXPIRATION_CHECK_INTERVAL_MS = 1000;

/** Refreshes trustmark countdown until expiration triggers renewal. */
export const displayingTrustmarkState =
  itwTrustmarkMachineSetup.createStateConfig({
    description: "Displays the QR Code and checks if it has expired",
    initial: "Idle",
    entry: "resetAttempts",
    states: {
      Idle: {
        after: {
          [TRUSTMARK_EXPIRATION_CHECK_INTERVAL_MS]: {
            target: "Checking"
          }
        }
      },
      Checking: {
        entry: "updateExpirationSeconds",
        always: [
          {
            guard: "isTrustmarkExpired",
            actions: "resetTrustmark",
            target: "#itwTrustmarkMachine.CheckingWalletInstanceAttestation"
          },
          {
            target: "Idle"
          }
        ]
      }
    }
  } as const);
