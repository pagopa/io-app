import { ActionType, createAsyncAction } from "typesafe-actions";
import { CitizenOptInStatusEnum } from "../../../../../../definitions/bpd/citizen_v2/CitizenOptInStatus";

/**
 * This file contains all the action related to the bpd details like the activation status, value, etc.
 */

export type ActivationStatus = "never" | "unsubscribed" | "subscribed";
// TODO change payload for loadBpdActivationStatus with this one
export type BpdActivationPayload = {
  enabled: boolean;
  activationStatus: ActivationStatus;
  payoffInstr: string | undefined;
  optInStatus?: CitizenOptInStatusEnum;
  technicalAccount?: string;
};

/**
 * Request the activation status for the user to the bpd program
 */
export const bpdLoadActivationStatus = createAsyncAction(
  "BPD_LOAD_ACTIVATION_STATUS_REQUEST",
  "BPD_LOAD_ACTIVATION_STATUS_SUCCESS",
  "BPD_LOAD_ACTIVATION_STATUS_FAILURE"
)<void, BpdActivationPayload, Error>();

export const bpdAllData = createAsyncAction(
  "BPD_ALL_DATA_REQUEST",
  "BPD_ALL_DATA_SUCCESS",
  "BPD_ALL_DATA_FAILURE"
)<void, void, Error>();

export type BpdDetailsActions =
  | ActionType<typeof bpdLoadActivationStatus>
  | ActionType<typeof bpdAllData>;
