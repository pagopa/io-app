import { StateFrom } from "xstate";
import { ItwProximityMachine } from "./machine";
import { ItwPresentationTags } from "./tags";

type MachineSnapshot = StateFrom<ItwProximityMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwPresentationTags.Loading);

export const selectIsSuccess = (snapshot: MachineSnapshot) =>
  snapshot.matches("Success");

export const selectQRCodeString = (snapshot: MachineSnapshot) =>
  snapshot.context.qrCodeString;

export const selectShouldPresentQRCodeBottomSheet = (
  snapshot: MachineSnapshot
) => snapshot.hasTag(ItwPresentationTags.Presenting);

export const selectFailure = (snapshot: MachineSnapshot) =>
  snapshot.context.failure;

export const selectProximityDetails = (snapshot: MachineSnapshot) =>
  snapshot.context.proximityDetails;

export const isInitialLoadingSelector = (snapshot: MachineSnapshot) =>
  snapshot.matches({ Presentment: { SendingDocuments: "Initial" } });

export const isReminderLoadingSelector = (snapshot: MachineSnapshot) =>
  snapshot.matches({ Presentment: { SendingDocuments: "Reminder" } });

export const hasGivenConsentSelector = (snapshot: MachineSnapshot) =>
  snapshot.context.hasGivenConsent;
