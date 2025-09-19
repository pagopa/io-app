import { SnapshotFrom } from "xstate";
import { IdPayTags } from "../../common/machine/tags";
import { idPayPaymentMachine } from "./machine";

type MachineSnapshot = SnapshotFrom<typeof idPayPaymentMachine>;

export const isAuthorizingSelector = (snapshot: MachineSnapshot) =>
  snapshot.matches("Authorizing");

export const isCancellingSelector = (snapshot: MachineSnapshot) =>
  snapshot.matches("Cancelling");

export const isCancelledSelector = (snapshot: MachineSnapshot) =>
  snapshot.matches("AuthorizationCancelled");

export const failureSelector = (snapshot: MachineSnapshot) =>
  snapshot.context.failure;

export const transactionDataSelector = (snapshot: MachineSnapshot) =>
  snapshot.context.transactionData;

export const areButtonsDisabledSelector = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(IdPayTags.DisableButtons);

export const dataEntrySelector = (
  snapshot: MachineSnapshot
): "qr_code" | "manual" => snapshot.context.data_entry || "qr_code";
