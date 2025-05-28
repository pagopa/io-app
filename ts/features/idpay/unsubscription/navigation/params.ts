import { IdPayUnsubscriptionConfirmationScreenParams } from "../screens/IdPayUnsubscriptionConfirmationScreen";
import { IdPayUnsubscriptionRoutes } from "./routes";

export type IdPayUnsubscriptionParamsList = {
  [IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION]: IdPayUnsubscriptionConfirmationScreenParams;
  [IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT]: undefined;
};
