import { CgnActivationActions } from "./activation";
import { CgnDetailsActions } from "./details";
import { CgnMerchantsAction } from "./merchants";

export type CgnActions =
  | CgnActivationActions
  | CgnDetailsActions
  | CgnMerchantsAction;
