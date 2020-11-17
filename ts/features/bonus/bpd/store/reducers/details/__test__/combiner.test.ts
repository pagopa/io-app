import * as pot from "italia-ts-commons/lib/pot";
import { applicationChangeState } from "../../../../../../../store/actions/application";
import { appReducer } from "../../../../../../../store/reducers";
import { GlobalState } from "../../../../../../../store/reducers/types";
import { BpdAmount, bpdAmountLoad } from "../../../actions/amount";
import { bpdPeriodsLoad } from "../../../actions/periods";
import { zeroAmount } from "../../__mock__/amount";
import { closedPeriod } from "../../__mock__/periods";
import { bpdAllPeriodsWithAmountSelector, BpdPeriodAmount } from "../combiner";

jest.mock("@react-native-community/async-storage", () => ({
  AsyncStorage: jest.fn()
}));

jest.mock("react-native-share", () => ({
  open: jest.fn()
}));

jest.unmock("react-navigation");

describe("Bpd reducers combiner tests", () => {
  it("Periods NOT pot.Some should return not pot.Some", () => {
    expect(bpdAllPeriodsWithAmountSelector.resultFunc(pot.none, {})).toBe(
      pot.none
    );
    expect(
      bpdAllPeriodsWithAmountSelector.resultFunc(pot.noneLoading, {})
    ).toBe(pot.noneLoading);
    expect(
      bpdAllPeriodsWithAmountSelector.resultFunc(pot.noneError(new Error()), {})
    ).toStrictEqual(pot.noneError(new Error()));
  });
  it("No matching between a period and amount should return a pot.Some with empty array", () => {
    expect(
      bpdAllPeriodsWithAmountSelector.resultFunc(pot.some([closedPeriod]), {})
    ).toStrictEqual(pot.some([]));
  });
  it("Matching between a period and an amount NOT pot.some should return a pot.Some with empty array", () => {
    expect(
      bpdAllPeriodsWithAmountSelector.resultFunc(pot.some([closedPeriod]), {
        [closedPeriod.awardPeriodId]: pot.none
      })
    ).toStrictEqual(pot.some([]));
    expect(
      bpdAllPeriodsWithAmountSelector.resultFunc(pot.some([closedPeriod]), {
        [closedPeriod.awardPeriodId]: pot.noneLoading
      })
    ).toStrictEqual(pot.some([]));
    expect(
      bpdAllPeriodsWithAmountSelector.resultFunc(pot.some([closedPeriod]), {
        [closedPeriod.awardPeriodId]: pot.noneError(new Error())
      })
    ).toStrictEqual(pot.some([]));
  });
  it("Matching between a period and amount should return a pot.Some* with BpdAmountPeriod", () => {
    expect(
      bpdAllPeriodsWithAmountSelector.resultFunc(pot.some([closedPeriod]), {
        [closedPeriod.awardPeriodId]: pot.some(zeroAmount)
      })
    ).toStrictEqual(
      pot.some([{ period: closedPeriod, amount: zeroAmount }] as ReadonlyArray<
        BpdPeriodAmount
      >)
    );

    expect(
      bpdAllPeriodsWithAmountSelector.resultFunc(
        pot.someLoading([closedPeriod]),
        {
          [closedPeriod.awardPeriodId]: pot.some(zeroAmount)
        }
      )
    ).toStrictEqual(
      pot.someLoading([
        { period: closedPeriod, amount: zeroAmount }
      ] as ReadonlyArray<BpdPeriodAmount>)
    );
  });

  expect(
    bpdAllPeriodsWithAmountSelector.resultFunc(
      pot.someError([closedPeriod], new Error()),
      {
        [closedPeriod.awardPeriodId]: pot.some(zeroAmount)
      }
    )
  ).toStrictEqual(
    pot.someError(
      [{ period: closedPeriod, amount: zeroAmount }] as ReadonlyArray<
        BpdPeriodAmount
      >,
      new Error()
    )
  );

  it("Test re-computations only when store interesting part changes", () => {
    // eslint-disable-next-line functional/no-let
    let globalState: GlobalState = appReducer(
      undefined,
      applicationChangeState("active")
    );
    const customAmount: BpdAmount = {
      ...zeroAmount,
      awardPeriodId: closedPeriod.awardPeriodId
    };

    expect(bpdAllPeriodsWithAmountSelector(globalState)).toBe(pot.none);
    expect(bpdAllPeriodsWithAmountSelector(globalState)).toBe(pot.none);
    expect(bpdAllPeriodsWithAmountSelector(globalState)).toBe(pot.none);
    // Compute the value only one time with the same state
    expect(bpdAllPeriodsWithAmountSelector.recomputations()).toBe(1);
    globalState = appReducer(
      globalState,
      bpdPeriodsLoad.success([closedPeriod])
    );
    globalState = appReducer(globalState, bpdAmountLoad.success(customAmount));
    expect(bpdAllPeriodsWithAmountSelector(globalState)).toStrictEqual(
      pot.some([
        { period: closedPeriod, amount: customAmount }
      ] as ReadonlyArray<BpdPeriodAmount>)
    );
    expect(bpdAllPeriodsWithAmountSelector(globalState)).toStrictEqual(
      pot.some([
        { period: closedPeriod, amount: customAmount }
      ] as ReadonlyArray<BpdPeriodAmount>)
    );
    // The state changed one time, only one recomputation
    expect(bpdAllPeriodsWithAmountSelector.recomputations()).toBe(2);
  });
});
