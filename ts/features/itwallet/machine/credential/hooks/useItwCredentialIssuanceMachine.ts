import { useSelector } from "@xstate/react";
import { StateFrom, ActorRefFrom } from "xstate";
import { ItwCredentialIssuanceMachine } from "../machine";
import { ItwEidIssuanceMachineContext } from "../../eid/provider";
import { ItwCredentialIssuanceMachineContext } from "../provider";

type CredentialIssuanceSnapshot = StateFrom<ItwCredentialIssuanceMachine>;
type CredentialIssuanceActorRef = ActorRefFrom<ItwCredentialIssuanceMachine>;

/**
 * This hook returns the actorRef and snapshot of the Credential Issuance Machine,
 * automatically detecting whether the machine is running:
 * - as a child spawned by the eID Issuance Machine
 * - as a standalone machine outside the eID flow.
 *
 * @returns An object containing:
 * - `actorRef`: the reference to the active Credential Issuance Machine
 * - `snapshot`: the current state snapshot of that machine
 */
export const useItwCredentialIssuanceMachine = () => {
  // Snapshot of the eID issuance machine
  const eidSnapshot = ItwEidIssuanceMachineContext.useSelector(s => s);

  // Standalone credential issuance machine reference
  const standaloneRef = ItwCredentialIssuanceMachineContext.useActorRef();

  // Child credential issuance machine reference (if spawned by the eID flow)
  const childRef = eidSnapshot.children?.credentialIssuanceMachine as
    | CredentialIssuanceActorRef
    | undefined;

  // Prefer child machine; fallback to standalone one
  const credentialIssuanceMachineRef = childRef ?? standaloneRef;

  // Current snapshot of the selected credential issuance machine
  const credentialIssuanceMachineSnapshot = useSelector(
    credentialIssuanceMachineRef,
    snap => snap
  ) as CredentialIssuanceSnapshot;

  return {
    credentialIssuanceMachineRef,
    credentialIssuanceMachineSnapshot
  };
};
