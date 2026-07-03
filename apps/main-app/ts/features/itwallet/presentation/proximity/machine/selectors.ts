import { StateFrom } from "xstate";
import { ProximityFlow } from "../analytics/types";
import { ItwProximityMachine } from "./machine";
import { ItwPresentationTags } from "./tags";

type MachineSnapshot = StateFrom<ItwProximityMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwPresentationTags.Loading);

export const selectIsSending = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwPresentationTags.Sending);

export const selectIsSuccess = (snapshot: MachineSnapshot) =>
  snapshot.matches("Success");

export const selectIsNfcRetrieval = (snapshot: MachineSnapshot) =>
  snapshot.context.retrievalMethod === "nfc";

export const selectProximityFlow = (
  snapshot: MachineSnapshot
): ProximityFlow =>
  snapshot.context.engagementMode === "nfc" ? "nfc" : "qr_code";

export const selectQRCodeString = (snapshot: MachineSnapshot) =>
  snapshot.context.qrCodeString;

export const selectFailure = (snapshot: MachineSnapshot) =>
  snapshot.context.failure;

export const selectProximityDetails = (snapshot: MachineSnapshot) =>
  snapshot.context.proximityDetails;

export const hasGivenConsentSelector = (snapshot: MachineSnapshot) =>
  snapshot.context.grantedConsentKey !== undefined;
