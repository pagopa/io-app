import * as pot from "italia-ts-commons/lib/pot";
import { remoteReady } from "../../../model/RemoteValue";
import { AwardPeriodId } from "../../actions/periods";
import { eligibleAmount, zeroAmount } from "../__mock__/amount";
import {
  activePeriod,
  closedPeriod,
  inactivePeriod
} from "../__mock__/periods";
import { bpdPeriodsAmountWalletVisibleSelector } from "../details/combiner";
import { BpdPeriodWithAmount } from "../details/periods";

const inactivePeriodA: BpdPeriodWithAmount = {
  amount: zeroAmount,
  ...{
    ...inactivePeriod,
    startDate: new Date("2025-01-01"),
    awardPeriodId: 55 as AwardPeriodId
  }
};
const inactivePeriodB: BpdPeriodWithAmount = {
  amount: zeroAmount,
  ...inactivePeriod
};
const inactivePeriodC: BpdPeriodWithAmount = {
  amount: zeroAmount,
  ...{
    ...inactivePeriod,
    startDate: new Date("2022-01-01"),
    awardPeriodId: 56 as AwardPeriodId
  }
};

const activePeriodAmount: BpdPeriodWithAmount = {
  amount: zeroAmount,
  ...activePeriod
};

const closedPeriodZeroAmount: BpdPeriodWithAmount = {
  amount: zeroAmount,
  ...closedPeriod
};

const closedPeriodWithAmount: BpdPeriodWithAmount = {
  amount: eligibleAmount,
  ...closedPeriod
};

describe("test bpdPeriodsAmountWalletVisibleSelector when bpd is enabled", () => {
  it("one inactive period should return one inactive period", () => {
    const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
      pot.some([inactivePeriodB]),
      remoteReady(true)
    );

    expect(pot.isSome(visiblePeriods)).toBeTruthy();
    if (pot.isSome(visiblePeriods)) {
      expect(visiblePeriods.value.length).toBe(1);
      expect(visiblePeriods.value[0].awardPeriodId).toBe(
        inactivePeriod.awardPeriodId
      );
    }
  });
  it("with multiple inactive period should return the most recent inactive period", () => {
    const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
      pot.some([inactivePeriodA, inactivePeriodB, inactivePeriodC]),
      remoteReady(true)
    );

    expect(pot.isSome(visiblePeriods)).toBeTruthy();
    if (pot.isSome(visiblePeriods)) {
      expect(visiblePeriods.value.length).toBe(1);
      expect(visiblePeriods.value[0].awardPeriodId).toBe(
        inactivePeriodB.awardPeriodId
      );
    }
  });

  it(
    "with multiple inactive period and an active period " +
      "should return the active period",
    () => {
      const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
        pot.some([
          activePeriodAmount,
          inactivePeriodA,
          inactivePeriodB,
          inactivePeriodC
        ]),
        remoteReady(true)
      );

      expect(pot.isSome(visiblePeriods)).toBeTruthy();
      if (pot.isSome(visiblePeriods)) {
        expect(visiblePeriods.value.length).toBe(1);
        expect(visiblePeriods.value[0].awardPeriodId).toBe(
          activePeriodAmount.awardPeriodId
        );
      }
    }
  );

  it(
    "with multiple inactive period, an active period and a closed period (with amount zero) " +
      "should return the active period",
    () => {
      const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
        pot.some([
          closedPeriodZeroAmount,
          activePeriodAmount,
          inactivePeriodA,
          inactivePeriodB,
          inactivePeriodC
        ]),
        remoteReady(true)
      );

      expect(pot.isSome(visiblePeriods)).toBeTruthy();
      if (pot.isSome(visiblePeriods)) {
        expect(visiblePeriods.value.length).toBe(1);
        expect(visiblePeriods.value[0].awardPeriodId).toBe(
          activePeriodAmount.awardPeriodId
        );
      }
    }
  );

  it(
    "with multiple inactive period, an active period and a closed period (with amount > zero) " +
      "should return the active period and the closed period",
    () => {
      const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
        pot.some([
          closedPeriodWithAmount,
          activePeriodAmount,
          inactivePeriodA,
          inactivePeriodB,
          inactivePeriodC
        ]),
        remoteReady(true)
      );

      expect(pot.isSome(visiblePeriods)).toBeTruthy();
      if (pot.isSome(visiblePeriods)) {
        expect(visiblePeriods.value.length).toBe(2);
        expect(visiblePeriods.value[0].awardPeriodId).toBe(
          closedPeriodWithAmount.awardPeriodId
        );
        expect(visiblePeriods.value[1].awardPeriodId).toBe(
          activePeriodAmount.awardPeriodId
        );
      }
    }
  );

  it(
    "with multiple inactive period and a closed period (with amount > zero) " +
      "should return the closed period",
    () => {
      const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
        pot.some([
          closedPeriodWithAmount,
          inactivePeriodA,
          inactivePeriodB,
          inactivePeriodC
        ]),
        remoteReady(true)
      );

      expect(pot.isSome(visiblePeriods)).toBeTruthy();
      if (pot.isSome(visiblePeriods)) {
        expect(visiblePeriods.value.length).toBe(1);
        expect(visiblePeriods.value[0].awardPeriodId).toBe(
          closedPeriodWithAmount.awardPeriodId
        );
      }
    }
  );
  it(
    "with multiple inactive period and a closed period (with amount zero) " +
      "should return no periods",
    () => {
      const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
        pot.some([
          closedPeriodZeroAmount,
          inactivePeriodA,
          inactivePeriodB,
          inactivePeriodC
        ]),
        remoteReady(true)
      );

      expect(pot.isSome(visiblePeriods)).toBeTruthy();
      if (pot.isSome(visiblePeriods)) {
        expect(visiblePeriods.value.length).toBe(0);
      }
    }
  );
});

describe("test bpdPeriodsAmountWalletVisibleSelector when bpd is disabled", () => {
  it("one inactive period should return no periods", () => {
    const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
      pot.some([inactivePeriodB]),
      remoteReady(false)
    );

    expect(pot.isSome(visiblePeriods)).toBeTruthy();
    if (pot.isSome(visiblePeriods)) {
      expect(visiblePeriods.value.length).toBe(0);
    }
  });
  it("with multiple inactive period should return no periods", () => {
    const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
      pot.some([inactivePeriodA, inactivePeriodB, inactivePeriodC]),
      remoteReady(false)
    );

    expect(pot.isSome(visiblePeriods)).toBeTruthy();
    if (pot.isSome(visiblePeriods)) {
      expect(visiblePeriods.value.length).toBe(0);
    }
  });

  it(
    "with multiple inactive period and an active period " +
      "should return no periods",
    () => {
      const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
        pot.some([
          activePeriodAmount,
          inactivePeriodA,
          inactivePeriodB,
          inactivePeriodC
        ]),
        remoteReady(false)
      );

      expect(pot.isSome(visiblePeriods)).toBeTruthy();
      if (pot.isSome(visiblePeriods)) {
        expect(visiblePeriods.value.length).toBe(0);
      }
    }
  );

  it(
    "with multiple inactive period, an active period and a closed period (with amount zero) " +
      "should return no periods",
    () => {
      const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
        pot.some([
          closedPeriodZeroAmount,
          activePeriodAmount,
          inactivePeriodA,
          inactivePeriodB,
          inactivePeriodC
        ]),
        remoteReady(false)
      );

      expect(pot.isSome(visiblePeriods)).toBeTruthy();
      if (pot.isSome(visiblePeriods)) {
        expect(visiblePeriods.value.length).toBe(0);
      }
    }
  );

  it(
    "with multiple inactive period, an active period and a closed period (with amount > zero) " +
      "should return the closed period",
    () => {
      const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
        pot.some([
          closedPeriodWithAmount,
          activePeriodAmount,
          inactivePeriodA,
          inactivePeriodB,
          inactivePeriodC
        ]),
        remoteReady(false)
      );

      expect(pot.isSome(visiblePeriods)).toBeTruthy();
      if (pot.isSome(visiblePeriods)) {
        expect(visiblePeriods.value.length).toBe(1);
        expect(visiblePeriods.value[0].awardPeriodId).toBe(
          closedPeriodWithAmount.awardPeriodId
        );
      }
    }
  );

  it(
    "with multiple inactive period and a closed period (with amount > zero) " +
      "should return the closed period",
    () => {
      const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
        pot.some([
          closedPeriodWithAmount,
          inactivePeriodA,
          inactivePeriodB,
          inactivePeriodC
        ]),
        remoteReady(false)
      );

      expect(pot.isSome(visiblePeriods)).toBeTruthy();
      if (pot.isSome(visiblePeriods)) {
        expect(visiblePeriods.value.length).toBe(1);
        expect(visiblePeriods.value[0].awardPeriodId).toBe(
          closedPeriodWithAmount.awardPeriodId
        );
      }
    }
  );
  it(
    "with multiple inactive period and a closed period (with amount zero) " +
      "should return no periods",
    () => {
      const visiblePeriods = bpdPeriodsAmountWalletVisibleSelector.resultFunc(
        pot.some([
          closedPeriodZeroAmount,
          inactivePeriodA,
          inactivePeriodB,
          inactivePeriodC
        ]),
        remoteReady(false)
      );

      expect(pot.isSome(visiblePeriods)).toBeTruthy();
      if (pot.isSome(visiblePeriods)) {
        expect(visiblePeriods.value.length).toBe(0);
      }
    }
  );
});
