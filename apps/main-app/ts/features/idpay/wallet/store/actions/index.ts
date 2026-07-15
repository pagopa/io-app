import {
  ActionType,
  createAsyncAction,
  createStandardAction
} from "typesafe-actions";

import { InitiativesWithInstrumentDTO } from "../../../../../../definitions/idpay/InitiativesWithInstrumentDTO";
import { ListUsersOnboardingStatusDTO } from "../../../../../../definitions/idpay/ListUsersOnboardingStatusDTO";
import { WalletDTO } from "../../../../../../definitions/idpay/WalletDTO";
import { NetworkError } from "../../../../../utils/errors";

export type IdPayInitiativesFromInstrumentPayloadType = {
  idWallet: string;
  isRefreshing?: boolean;
};

export type IdpayInitiativesInstrumentDeletePayloadType = {
  initiativeId: string;
  instrumentId: string;
};

export type IdpayInitiativesInstrumentEnrollPayloadType = {
  idWallet: string;
  initiativeId: string;
};

type InitiativeId = { initiativeId: string };
type NetworkErrorWithInitiativeId = {
  error: NetworkError;
  initiativeId: string;
};

export const idPayWalletGet = createAsyncAction(
  "IDPAY_WALLET_REQUEST",
  "IDPAY_WALLET_SUCCESS",
  "IDPAY_WALLET_FAILURE"
)<void, WalletDTO, NetworkError>();

export const idPayInitiativesFromInstrumentGet = createAsyncAction(
  "IDPAY_INITIATIVES_FROM_INSTRUMENT_REQUEST",
  "IDPAY_INITIATIVES_FROM_INSTRUMENT_SUCCESS",
  "IDPAY_INITIATIVES_FROM_INSTRUMENT_FAILURE"
)<
  IdPayInitiativesFromInstrumentPayloadType,
  InitiativesWithInstrumentDTO,
  NetworkError
>();

export const idpayInitiativesInstrumentEnroll = createAsyncAction(
  "IDPAY_INITIATIVES_INSTRUMENT_ENROLL_REQUEST",
  "IDPAY_INITIATIVES_INSTRUMENT_ENROLL_SUCCESS",
  "IDPAY_INITIATIVES_INSTRUMENT_ENROLL_FAILURE"
)<
  IdpayInitiativesInstrumentEnrollPayloadType,
  InitiativeId,
  NetworkErrorWithInitiativeId
>();

export const idpayInitiativesInstrumentDelete = createAsyncAction(
  "IDPAY_INITIATIVES_INSTRUMENT_DELETE_REQUEST",
  "IDPAY_INITIATIVES_INSTRUMENT_DELETE_SUCCESS",
  "IDPAY_INITIATIVES_INSTRUMENT_DELETE_FAILURE"
)<
  IdpayInitiativesInstrumentDeletePayloadType,
  InitiativeId,
  NetworkErrorWithInitiativeId
>();

export const idPayInitiativesFromInstrumentRefreshStart = createStandardAction(
  "IDPAY_INITIATIVES_FROM_INSTRUMENT_REFRESH_START"
)<IdPayInitiativesFromInstrumentPayloadType>();

export const idPayInitiativesFromInstrumentRefreshStop = createStandardAction(
  "IDPAY_INITIATIVES_FROM_INSTRUMENT_REFRESH_STOP"
)();

export const setIdPayOnboardingSucceeded = createStandardAction(
  "IDPAY_ONBOARDING_SUCCEEDED_SET"
)<boolean>();

export const idPayInitiativeWaitingListGet = createAsyncAction(
  "IDPAY_INITIATIVE_WAITING_LIST_REQUEST",
  "IDPAY_INITIATIVE_WAITING_LIST_SUCCESS",
  "IDPAY_INITIATIVE_WAITING_LIST_FAILURE"
)<void, ListUsersOnboardingStatusDTO, NetworkError>();

export type IdPayWalletActions =
  | ActionType<typeof idPayInitiativesFromInstrumentGet>
  | ActionType<typeof idPayInitiativesFromInstrumentRefreshStart>
  | ActionType<typeof idPayInitiativesFromInstrumentRefreshStop>
  | ActionType<typeof idpayInitiativesInstrumentDelete>
  | ActionType<typeof idpayInitiativesInstrumentEnroll>
  | ActionType<typeof idPayInitiativeWaitingListGet>
  | ActionType<typeof idPayWalletGet>
  | ActionType<typeof setIdPayOnboardingSucceeded>;
