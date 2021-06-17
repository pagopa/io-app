import { ActionType, createStandardAction } from "typesafe-actions";
import { SvBeneficiaryCategory } from "../../types/SvVoucherRequest";

/**
 * The user chooses to start the workflow to generate a new SiciliaVola voucher
 */
export const svGenerateVoucherStart = createStandardAction(
  "SV_GENERATE_VOUCHER_START"
)<void>();
/**
 * The user completes the workflow to generate a new SiciliaVola voucher
 * (the request is sent and we receive an OK or a timeout response)
 */
export const svGenerateVoucherCompleted = createStandardAction(
  "SV_GENERATE_VOUCHER_COMPLETED"
)<void>();

/**
 * The user chooses to cancel the generation of a SiciliaVola voucher (no voucher request has been sent)
 */
export const svGenerateVoucherCancel = createStandardAction(
  "SV_GENERATE_VOUCHER_CANCEL"
)<void>();

/**
 * The user chooses `back` from the first screen
 */
export const svGenerateVoucherBack = createStandardAction(
  "SV_GENERATE_VOUCHER_BACK"
)<void>();

/**
 * The workflow fails
 */
export const svGenerateVoucherFailure = createStandardAction(
  "SV_GENERATE_VOUCHER_FAILURE"
)<string>();

/**
 * First step of the voucher generation: category selection
 */
export const svGenerateVoucherSelectCategory = createStandardAction(
  "SV_GENERATE_VOUCHER_SELECT_CATEGORY"
)<SvBeneficiaryCategory>();

export type SvVoucherGenerationActions =
  | ActionType<typeof svGenerateVoucherStart>
  | ActionType<typeof svGenerateVoucherCompleted>
  | ActionType<typeof svGenerateVoucherBack>
  | ActionType<typeof svGenerateVoucherCancel>
  | ActionType<typeof svGenerateVoucherFailure>
  | ActionType<typeof svGenerateVoucherSelectCategory>;
