import { InitiativeRewardTypeEnum } from "../../../../../definitions/idpay/InitiativeDTO";
import * as Context from "./context";

export interface Input {
  readonly initiativeId: string;
  readonly initiativeName: string | undefined;
  readonly initiativeType: InitiativeRewardTypeEnum | undefined;
}

export const Input = (input: Input): Promise<Context.Context> =>
  Promise.resolve({ ...input });
