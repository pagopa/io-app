import { CdcSelectedBonus } from "../types/CdcBonusRequest";

// Utility function used to sort the array of selectedBonus by year
export const compareSelectedBonusByYear = (
  firstBonus: CdcSelectedBonus,
  secondBonus: CdcSelectedBonus
) => (firstBonus.year > secondBonus.year ? 1 : -1);
