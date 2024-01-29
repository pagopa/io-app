import { CdcActions } from "../../../cdc/store/actions";
import { CgnActions } from "../../../cgn/store/actions";
import { SvActions } from "../../../siciliaVola/store/actions";
import { AvailableBonusesActions } from "./availableBonusesTypes";

export type BonusActions =
  | AvailableBonusesActions
  | CgnActions
  | SvActions
  | CdcActions;
