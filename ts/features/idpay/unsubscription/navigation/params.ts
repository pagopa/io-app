import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import { IdPayUnsubscriptionRoutes } from "./routes";

export type IdPayUnsubscriptionNavigatorParams = {
  initiativeId: string;
  initiativeName?: string;
  initiativeType?: InitiativeRewardTypeEnum;
};

export type IdPayUnsubscriptionParamsList = {
  [IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_NAVIGATOR]: IdPayUnsubscriptionNavigatorParams;
  [IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_CONFIRMATION]: undefined;
  [IdPayUnsubscriptionRoutes.IDPAY_UNSUBSCRIPTION_RESULT]: undefined;
};
