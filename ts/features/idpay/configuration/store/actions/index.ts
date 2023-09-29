import {
  ActionType,
  createStandardAction,
  createAsyncAction
} from "typesafe-actions";
import { InstrumentListDTO } from "../../../../../../definitions/idpay/InstrumentListDTO";
import { NetworkError } from "../../../../../utils/errors";

export type IdPayInitiativeInstrumentsGetPayloadType = {
  initiativeId: string;
  isRefreshing?: boolean;
};

export const idpayInitiativeInstrumentsGet = createAsyncAction(
  "IDPAY_INITIATIVE_INSTRUMENTS_GET_REQUEST",
  "IDPAY_INITIATIVE_INSTRUMENTS_GET_SUCCESS",
  "IDPAY_INITIATIVE_INSTRUMENTS_GET_FAILURE"
)<IdPayInitiativeInstrumentsGetPayloadType, InstrumentListDTO, NetworkError>();

export type IdPayInitiativeInstrumentsDeletePayloadType = {
  initiativeId: string;
  instrumentId: string;
};

export type IdPayInitiativeInstrumentsDeleteErrorPayloadType = {
  instrumentId: string;
  error: NetworkError;
};

export const idpayInitiativeInstrumentDelete = createAsyncAction(
  "IDPAY_INITIATIVE_INSTRUMENT_DELETE_REQUEST",
  "IDPAY_INITIATIVE_INSTRUMENT_DELETE_SUCCESS",
  "IDPAY_INITIATIVE_INSTRUMENT_DELETE_FAILURE"
)<
  IdPayInitiativeInstrumentsDeletePayloadType,
  IdPayInitiativeInstrumentsDeletePayloadType,
  IdPayInitiativeInstrumentsDeleteErrorPayloadType
>();

export const idPayInitiativesInstrumentRefreshStart = createStandardAction(
  "IDPAY_INITIATIVES_INSTRUMENT_REFRESH_START"
)<IdPayInitiativeInstrumentsGetPayloadType>();

export const idPayInitiativesInstrumentRefreshStop = createStandardAction(
  "IDPAY_INITIATIVES_INSTRUMENT_REFRESH_STOP"
)();

export type IDPayInitiativeConfigurationActions = ActionType<
  | typeof idpayInitiativeInstrumentsGet
  | typeof idpayInitiativeInstrumentDelete
  | typeof idPayInitiativesInstrumentRefreshStart
  | typeof idPayInitiativesInstrumentRefreshStop
>;
