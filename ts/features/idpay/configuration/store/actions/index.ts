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

type IdPayInitiativeInstrumentsDeletePayloadType = {
  initiativeId: string;
  instrumentId: string;
};

type IdPayInitiativeInstrumentsDeleteErrorPayloadType = {
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

export const idPayInitiativeInstrumentsRefreshStart = createStandardAction(
  "IDPAY_INITIATIVE_INSTRUMENTS_REFRESH_START"
)<IdPayInitiativeInstrumentsGetPayloadType>();

export const idPayInitiativeInstrumentsRefreshStop = createStandardAction(
  "IDPAY_INITIATIVE_INSTRUMENTS_REFRESH_STOP"
)();

export type IDPayInitiativeConfigurationActions = ActionType<
  | typeof idpayInitiativeInstrumentsGet
  | typeof idpayInitiativeInstrumentDelete
  | typeof idPayInitiativeInstrumentsRefreshStart
  | typeof idPayInitiativeInstrumentsRefreshStop
>;
