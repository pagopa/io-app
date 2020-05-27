import { BonusStatusEnum, BonusVacanzaMock } from "../mock/mockData";

// return true if the bonus state is active
export const isBonusActive = (bonus: BonusVacanzaMock) =>
  bonus.status === BonusStatusEnum.ACTIVE;
