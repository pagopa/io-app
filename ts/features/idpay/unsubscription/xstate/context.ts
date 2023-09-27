import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";

export type Context = {
  initiativeId: string;
  initiativeName?: string;
  initiativeType?: InitiativeRewardTypeEnum;
};
