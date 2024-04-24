import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";

export interface Context {
  readonly initiativeId: string;
  readonly initiativeName: string | undefined;
  readonly initiativeType: InitiativeRewardTypeEnum | undefined;
}

export const Context: Context = {
  initiativeId: "",
  initiativeName: undefined,
  initiativeType: undefined
};
