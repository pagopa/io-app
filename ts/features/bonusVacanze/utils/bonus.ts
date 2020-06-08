import { fromNullable } from "fp-ts/lib/Option";
import { BonusActivationStatusEnum } from "../../../../definitions/bonus_vacanze/BonusActivationStatus";
import { BonusActivationWithQrCode } from "../../../../definitions/bonus_vacanze/BonusActivationWithQrCode";
import { formatDateAsLocal } from "../../../utils/dates";

export const ID_BONUS_VACANZE_TYPE = 1;

// return true if the bonus is active
export const isBonusActive = (bonus: BonusActivationWithQrCode) =>
  bonus.status === BonusActivationStatusEnum.ACTIVE;

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
