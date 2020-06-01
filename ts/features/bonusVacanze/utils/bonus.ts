import { fromNullable } from "fp-ts/lib/Option";
import { formatDateAsLocal } from "../../../utils/dates";
import { BonusStatusEnum, BonusVacanze } from "../types/bonusVacanzeActivation";

export const ID_BONUS_VACANZE_TYPE = 1;

// return true if the bonus is active
export const isBonusActive = (bonus: BonusVacanze) =>
  bonus.status === BonusStatusEnum.ACTIVE;

export const validityInterval = (
  bonusValidityFrom?: Date,
  bonusValidityTo?: Date
) =>
  fromNullable(bonusValidityFrom)
    .map(vf => formatDateAsLocal(vf, true))
    .chain(vfs =>
      fromNullable(bonusValidityTo)
        .map(vt => formatDateAsLocal(vt, true))
        .map(vts => `${vfs} - ${vts}`)
    )
    .fold(undefined, _ => _);
