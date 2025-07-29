import { UpgradeCredentialOutput } from "./actors";

type UpgradeCredentialDone = {
  type: "xstate.done.actor.0.itwCredentialUpgradeMachine.UpgradeCredential";
  output: UpgradeCredentialOutput;
};

export type CredentialUpgradeEvents = UpgradeCredentialDone;
