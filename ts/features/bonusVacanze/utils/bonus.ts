import { BonusStatusEnum, BonusVacanzaMock } from "../mock/mockData";

// return true if the bonus is active
export const isBonusActive = (bonus: BonusVacanzaMock) =>
  bonus.status === BonusStatusEnum.ACTIVE;

// return true if the bonus can be activable
export const isBonusActivable = (bonus: BonusVacanzaMock) =>
  bonus.status === BonusStatusEnum.CANCELLED ||
  bonus.status === BonusStatusEnum.FAILED;
