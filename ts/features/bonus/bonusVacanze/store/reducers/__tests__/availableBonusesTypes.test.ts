import * as pot from "italia-ts-commons/lib/pot";
import {
  AvailableBonusTypesState,
  isAvailableBonusErrorSelector,
  isAvailableBonusLoadingSelector,
  isAvailableBonusNoneErrorSelector,
  visibleAvailableBonusSelector
} from "../availableBonusesTypes";
import {
  availableBonuses,
  contentBonusVacanzeIT
} from "../../../__mock__/availableBonuses";
import { BonusesAvailable } from "../../../../../../../definitions/content/BonusesAvailable";
import { BonusVisibilityEnum } from "../../../../../../../definitions/content/BonusVisibility";
import {
  ID_BONUS_VACANZE_TYPE,
  ID_BPD_TYPE,
  ID_CGN_TYPE
} from "../../../utils/bonus";
import { BonusAvailable } from "../../../../../../../definitions/content/BonusAvailable";

const bonusMockContent = {
  name: "Bonus Vacanze",
  description: "Fino a 500€ a nucleo familiare per andare in vacanza in Italia",
  subtitle:
    "L'incentivo per supportare il settore del turismo dopo il lockdown richiesto dal COVID-19",
  title: "Richiesta Bonus Vacanze",
  content: contentBonusVacanzeIT,
  tos_url: "https://io.italia.it/app-content/bonus_vacanze_tos.html"
};

const mockBonus: BonusAvailable = {
  id_type: 4,
  it: bonusMockContent,
  en: bonusMockContent,
  valid_from: new Date(),
  valid_to: new Date(),
  is_active: false
};

jest.mock("../../../../../../config", () => ({
  cgnEnabled: true,
  bonusVacanzeEnabled: true
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

  it("should return the experimental bonus where the FF is ON", () => {
    const visibility = BonusVisibilityEnum.experimental;
    const bonuses: BonusesAvailable = [
      { ...mockBonus, id_type: ID_BONUS_VACANZE_TYPE, visibility },
      { ...mockBonus, id_type: ID_BONUS_VACANZE_TYPE, visibility },
      { ...mockBonus, id_type: ID_BPD_TYPE, visibility }
    ];
    const result = visibleAvailableBonusSelector.resultFunc(pot.some(bonuses));
    expect(result.length).toBe(2);
    expect(result).toEqual([bonuses[0], bonuses[1]]);
  });

  it("should return the experimental bonus where the FF is ON", () => {
    const visibility = BonusVisibilityEnum.experimental;
    const bonuses: BonusesAvailable = [
      {
        ...mockBonus,
        id_type: ID_BONUS_VACANZE_TYPE,
        visibility
      },
      {
        ...mockBonus,
        id_type: ID_BPD_TYPE,
        visibility
      },
      {
        ...mockBonus,
        id_type: ID_CGN_TYPE,
        visibility
      },
      {
        ...mockBonus,
        id_type: -1,
        visibility
      }
    ];
    const result = visibleAvailableBonusSelector.resultFunc(pot.some(bonuses));
    expect(result.length).toBe(2);
    expect(result).toEqual([bonuses[0], bonuses[2]]);
  });
});

const loadingCases: ReadonlyArray<[
  input: AvailableBonusTypesState,
  expectedResult: boolean
]> = [
  [pot.noneLoading, true],
  [pot.none, false],
  [pot.some([mockBonus]), false],
  [pot.noneError(new Error()), false],
  [pot.someError([mockBonus], new Error()), false]
];

describe("isAvailableBonusLoadingSelector selector", () => {
  test.each(loadingCases)(
    "given %p as argument, returns %p",
    (firstArg, expectedResult) => {
      const result = isAvailableBonusLoadingSelector.resultFunc(firstArg);
      expect(result).toEqual(expectedResult);
    }
  );
});

const errorCases: ReadonlyArray<[
  input: AvailableBonusTypesState,
  expectedResult: boolean
]> = [
  [pot.noneLoading, false],
  [pot.none, false],
  [pot.some([mockBonus]), false],
  [pot.noneError(new Error()), true],
  [pot.someError([mockBonus], new Error()), true]
];
describe("isAvailableBonusErrorSelector selector", () => {
  test.each(errorCases)(
    "given %p as argument, returns %p",
    (firstArg, expectedResult) => {
      const result = isAvailableBonusErrorSelector.resultFunc(firstArg);
      expect(result).toEqual(expectedResult);
    }
  );
});

const noneErrorCases: ReadonlyArray<[
  firstInput: AvailableBonusTypesState,
  secondInput: boolean,
  expectedResult: boolean
]> = [
  [pot.noneLoading, true, true],
  [pot.noneLoading, false, false],
  [pot.none, true, true],
  [pot.none, false, false],
  [pot.some([mockBonus]), true, false],
  [pot.some([mockBonus]), false, false],
  [pot.noneError(new Error()), true, true],
  [pot.noneError(new Error()), false, false],
  [pot.someError([mockBonus], new Error()), true, false],
  [pot.someError([mockBonus], new Error()), false, false]
];
describe("isAvailableBonusNoneErrorSelector selector", () => {
  test.each(noneErrorCases)(
    "given %p,%p as argument, returns %p",
    (firstArg, secondArg, expectedResult) => {
      const result = isAvailableBonusNoneErrorSelector.resultFunc(
        firstArg,
        secondArg
      );
      expect(result).toEqual(expectedResult);
    }
  );
});
