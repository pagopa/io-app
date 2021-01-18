import * as pot from "italia-ts-commons/lib/pot";
import { visibleAvailableBonusSelector } from "../availableBonusesTypes";
import {
  availableBonuses,
  contentBonusVacanzeIT
} from "../../../mock/availableBonuses";
import { BonusesAvailable } from "../../../../../../../definitions/content/BonusesAvailable";
import { BonusVisibilityEnum } from "../../../../../../../definitions/content/BonusVisibility";

const bonusMockContent = {
  name: "Bonus Vacanze",
  description: "Fino a 500€ a nucleo familiare per andare in vacanza in Italia",
  subtitle:
    "L'incentivo per supportare il settore del turismo dopo il lockdown richiesto dal COVID-19",
  title: "Richiesta Bonus Vacanze",
  content: contentBonusVacanzeIT,
  tos_url: "https://io.italia.it/app-content/bonus_vacanze_tos.html"
};

const mockBonus = {
  id_type: 4,
  it: bonusMockContent,
  en: bonusMockContent,
  valid_from: new Date(),
  valid_to: new Date(),
  is_active: false
};

jest.mock("../../../../../../config", () => ({
  cgnEnabled: "YES"
}));

describe("availableBonusesTypes with FF enabled", () => {
  it("should return 2 bonuses available", () => {
    expect(
      visibleAvailableBonusSelector.resultFunc(pot.some([...availableBonuses]))
        .length
    ).toBe(2);
  });

  it("should return 2 bonuses available if an experimental bonus with no FF is available", () => {
    const bonuses: BonusesAvailable = [
      ...availableBonuses,
      {
        ...mockBonus,
        visibility: BonusVisibilityEnum.experimental
      }
    ];
    expect(
      visibleAvailableBonusSelector.resultFunc(pot.some(bonuses)).length
    ).toBe(2);
  });

  it("should return 3 bonuses available if an experimental bonus with no FF is available", () => {
    const bonuses: BonusesAvailable = [
      ...availableBonuses,
      {
        ...mockBonus,
        visibility: BonusVisibilityEnum.visible
      }
    ];
    expect(
      visibleAvailableBonusSelector.resultFunc(pot.some(bonuses)).length
    ).toBe(3);
  });

  it("should return 2 bonuses available if an hidden bonus is available", () => {
    const bonuses: BonusesAvailable = [
      ...availableBonuses,
      {
        ...mockBonus,
        visibility: BonusVisibilityEnum.hidden
      }
    ];
    expect(
      visibleAvailableBonusSelector.resultFunc(pot.some(bonuses)).length
    ).toBe(2);
  });
});
