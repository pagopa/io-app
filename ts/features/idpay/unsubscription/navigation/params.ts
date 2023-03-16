import { IDPayUnsubscriptionNavigatorParams } from "./navigator";
import { IDPayUnsubscriptionRoutes } from "./routes";

export type IDPayUnsubscriptionParamsList = {
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_MAIN]: IDPayUnsubscriptionNavigatorParams;
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION]: undefined;
  [IDPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT]: undefined;
};
