import { BonusStatusEnum, BonusVacanze } from "../types/bonusVacanze";

export const ID_BONUS_VACANZE_TYPE = 1;

// return true if the bonus is active
export const isBonusActive = (bonus: BonusVacanze) =>
  bonus.status === BonusStatusEnum.ACTIVE;

// return true if the bonus can be activable
export const isBonusActivable = (bonus: BonusVacanze) =>
  bonus.status === BonusStatusEnum.CANCELLED ||
  bonus.status === BonusStatusEnum.FAILED;
