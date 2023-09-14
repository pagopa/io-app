import { ActionType, createAsyncAction } from "typesafe-actions";
import { InstrumentListDTO } from "../../../../../../../definitions/idpay/InstrumentListDTO";
import { NetworkError } from "../../../../../../utils/errors";

export type IdPayInitiativePaymentMethodsGetPayloadType = {
  initiativeId: string;
};

export const idpayInitiativePaymentMethodsGet = createAsyncAction(
  "IDPAY_INITIATIVE_PAYMENT_METHODS_REQUEST",
  "IDPAY_INITIATIVE_PAYMENT_METHODS_SUCCESS",
  "IDPAY_INITIATIVE_PAYMENT_METHODS_FAILURE"
)<
  IdPayInitiativePaymentMethodsGetPayloadType,
  InstrumentListDTO,
  NetworkError
>();

export type IDPayInitiativeConfigurationActions = ActionType<
  typeof idpayInitiativePaymentMethodsGet
>;
