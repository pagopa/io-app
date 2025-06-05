import { StateFrom } from "xstate";
import { ItwProximityMachine } from "./machine";
import { ItwPresentationTags } from "./tags";

type MachineSnapshot = StateFrom<ItwProximityMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwPresentationTags.Loading);

export const selectIsPermissionsRequiredState = (snapshot: MachineSnapshot) =>
  snapshot.matches("PermissionsRequired");

export const selectIsBluetoothRequiredState = (snapshot: MachineSnapshot) =>
  snapshot.matches("BluetoothRequired");

export const selectQRCodeString = (snapshot: MachineSnapshot) =>
  snapshot.context.qrCodeString;

export const selectShouldPresentQRCodeBottomSheet = (
  snapshot: MachineSnapshot
) =>
  snapshot.matches("DisplayQRCode") ||
  snapshot.matches("QRCodeGenerationError");
