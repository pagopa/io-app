import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";
import {
  AvailableDestinations,
  Company,
  Hospital,
  Municipality,
  Province,
  Region,
  State,
  SvBeneficiaryCategory,
  University,
  VoucherRequest
} from "../../types/SvVoucherRequest";
import { NetworkError } from "../../../../../utils/errors";
import { SvVoucherGeneratedResponse } from "../../types/svVoucherResponse";

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

/**
 * Step for worker or sick, to confirm that the annual income is under the threshold limit
 */
export const svGenerateVoucherUnderThresholdIncome = createStandardAction(
  "SV_GENERATE_VOUCHER_UNDER_THRESHOLD_INCOME"
)<boolean>();

/**
 * Step for worker, to indicate the company data
 */
export const svGenerateVoucherSelectCompany = createStandardAction(
  "SV_GENERATE_VOUCHER_SELECT_COMPANY"
)<Company>();

/**
 * Step for sick, to indicate the hospital data
 */
export const svGenerateVoucherSelectHospital = createStandardAction(
  "SV_GENERATE_VOUCHER_SELECT_HOSPITAL"
)<Hospital>();

/**
 * Step for student, to indicate the university data
 */
export const svGenerateVoucherSelectUniversity = createStandardAction(
  "SV_GENERATE_VOUCHER_SELECT_UNIVERSITY"
)<University>();

export type FlightsDate = {
  departureDate: Date;
  returnDate?: Date;
};

/**
 * Step for student, worker and sick to indicate the departure and the return date
 */
export const svGenerateVoucherSelectFlightsDate = createStandardAction(
  "SV_GENERATE_VOUCHER_SELECT_FLIGHTS_DATE"
)<FlightsDate>();

/**
 * get and handle available destination for a voucher request
 */
// TODO: the request type will be defined when the API will be fixed
export const svGenerateVoucherAvailableDestination = createAsyncAction(
  "SV_GENERATE_VOUCHER_AVAILABLE_DESTINATION_REQUEST",
  "SV_GENERATE_VOUCHER_AVAILABLE_DESTINATION_SUCCESS",
  "SV_GENERATE_VOUCHER_AVAILABLE_DESTINATION_FAILURE"
)<void, AvailableDestinations, NetworkError>();

/**
 * get and handle the generated voucher
 */
// TODO: check the request type when the API will be fixed
export const svGenerateVoucherGeneratedVoucher = createAsyncAction(
  "SV_GENERATE_VOUCHER_GENERATED_VOUCHER_REQUEST",
  "SV_GENERATE_VOUCHER_GENERATED_VOUCHER_SUCCESS",
  "SV_GENERATE_VOUCHER_GENERATED_VOUCHER_FAILURE"
)<VoucherRequest, SvVoucherGeneratedResponse, NetworkError>();

/**
 * get and handle the available state
 */
// TODO: the request type will be defined when the API will be fixed
export const svGenerateVoucherAvailableState = createAsyncAction(
  "SV_GENERATE_VOUCHER_AVAILABLE_STATE_REQUEST",
  "SV_GENERATE_VOUCHER_AVAILABLE_STATE_SUCCESS",
  "SV_GENERATE_VOUCHER_AVAILABLE_STATE_FAILURE"
)<void, ReadonlyArray<State>, NetworkError>();

/**
 * get and handle the available region
 */
// TODO: check the request type when the API will be fixed
export const svGenerateVoucherAvailableRegion = createAsyncAction(
  "SV_GENERATE_VOUCHER_AVAILABLE_REGION_REQUEST",
  "SV_GENERATE_VOUCHER_AVAILABLE_REGION_SUCCESS",
  "SV_GENERATE_VOUCHER_AVAILABLE_REGION_FAILURE"
)<State, ReadonlyArray<Region>, NetworkError>();

/**
 * get and handle the available province
 */
// TODO: check the request type when the API will be fixed
export const svGenerateVoucherAvailableProvince = createAsyncAction(
  "SV_GENERATE_VOUCHER_AVAILABLE_PROVINCE_REQUEST",
  "SV_GENERATE_VOUCHER_AVAILABLE_PROVINCE_SUCCESS",
  "SV_GENERATE_VOUCHER_AVAILABLE_PROVINCE_FAILURE"
)<Region, ReadonlyArray<Province>, NetworkError>();

/**
 * get and handle the available municipality
 */
// TODO: check the request type when the API will be fixed
export const svGenerateVoucherAvailableMunicipality = createAsyncAction(
  "SV_GENERATE_VOUCHER_AVAILABLE_MUNICIPALITY_REQUEST",
  "SV_GENERATE_VOUCHER_AVAILABLE_MUNICIPALITY_SUCCESS",
  "SV_GENERATE_VOUCHER_AVAILABLE_MUNICIPALITY_FAILURE"
)<Province, ReadonlyArray<Municipality>, NetworkError>();

export type SvVoucherGenerationActions =
  | ActionType<typeof svGenerateVoucherStart>
  | ActionType<typeof svGenerateVoucherCompleted>
  | ActionType<typeof svGenerateVoucherBack>
  | ActionType<typeof svGenerateVoucherCancel>
  | ActionType<typeof svGenerateVoucherFailure>
  | ActionType<typeof svGenerateVoucherSelectCategory>
  | ActionType<typeof svGenerateVoucherUnderThresholdIncome>
  | ActionType<typeof svGenerateVoucherSelectUniversity>
  | ActionType<typeof svGenerateVoucherSelectCompany>
  | ActionType<typeof svGenerateVoucherSelectHospital>
  | ActionType<typeof svGenerateVoucherSelectFlightsDate>
  | ActionType<typeof svGenerateVoucherAvailableDestination>
  | ActionType<typeof svGenerateVoucherGeneratedVoucher>
  | ActionType<typeof svGenerateVoucherAvailableState>
  | ActionType<typeof svGenerateVoucherAvailableRegion>
  | ActionType<typeof svGenerateVoucherAvailableProvince>
  | ActionType<typeof svGenerateVoucherAvailableMunicipality>;
