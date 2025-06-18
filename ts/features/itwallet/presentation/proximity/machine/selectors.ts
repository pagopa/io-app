import { StateFrom } from "xstate";
import { ItwProximityMachine } from "./machine";
import { ItwPresentationTags } from "./tags";

type MachineSnapshot = StateFrom<ItwProximityMachine>;

export const selectIsLoading = (snapshot: MachineSnapshot) =>
  snapshot.hasTag(ItwPresentationTags.Loading);

export const selectIsPermissionsRequiredState = (snapshot: MachineSnapshot) =>
  snapshot.matches({ Permissions: "PermissionsRequired" });

export const selectIsBluetoothRequiredState = (snapshot: MachineSnapshot) =>
  snapshot.matches({ Bluetooth: "BluetoothRequired" });

export const selectQRCodeString = (snapshot: MachineSnapshot) =>
  snapshot.context.qrCodeString;

export const selectIsQRCodeGenerationError = (snapshot: MachineSnapshot) =>
  !!snapshot.context.isQRCodeGenerationError;

export const selectShouldPresentQRCodeBottomSheet = (
  snapshot: MachineSnapshot
) => snapshot.hasTag(ItwPresentationTags.Presenting);
