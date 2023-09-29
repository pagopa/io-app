import { ActionType, createAsyncAction } from "typesafe-actions";
import { InstrumentListDTO } from "../../../../../../definitions/idpay/InstrumentListDTO";
import { NetworkError } from "../../../../../utils/errors";

export type IdPayInitiativeInstrumentsGetPayloadType = {
  initiativeId: string;
};

export const idpayInitiativeInstrumentsGet = createAsyncAction(
  "IDPAY_INITIATIVE_PAYMENT_METHODS_REQUEST",
  "IDPAY_INITIATIVE_PAYMENT_METHODS_SUCCESS",
  "IDPAY_INITIATIVE_PAYMENT_METHODS_FAILURE"
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

export type IDPayInitiativeConfigurationActions = ActionType<
  typeof idpayInitiativeInstrumentsGet | typeof idpayInitiativeInstrumentDelete
>;
