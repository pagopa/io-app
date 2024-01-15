import { BonusVacanzeActions } from "../../../bonusVacanze/store/actions/bonusVacanze";
import { BpdActions } from "../../../bpd/store/actions";
import { CdcActions } from "../../../cdc/store/actions";
import { CgnActions } from "../../../cgn/store/actions";
import { SvActions } from "../../../siciliaVola/store/actions";
import { AvailableBonusesActions } from "./availableBonusesTypes";

export type BonusActions =
  | AvailableBonusesActions
  | BonusVacanzeActions
  | BpdActions
  | CgnActions
  | SvActions
  | CdcActions;
