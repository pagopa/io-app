import { subHours } from "date-fns";
import { DeepPartial } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  itwLastStatusUpdateDateSelector,
  itwNeedWalletInstanceStatusCheck
} from "..";

const buildState = (
  lastStatusUpdateDate: string | undefined
): DeepPartial<GlobalState> => ({
  features: {
    itWallet: {
      walletInstance: {
        lastStatusUpdateDate
      }
    }
  }
});

describe("itwNeedWalletInstanceStatusCheck", () => {
  it("returns true when lastStatusUpdateDate is undefined", () => {
    const state = buildState(undefined);
    expect(itwNeedWalletInstanceStatusCheck(state as GlobalState)).toBe(true);
  });

  it("returns true when last check was exactly 24 hours ago", () => {
    const date = subHours(new Date(), 24).toISOString();
    const state = buildState(date);
    expect(itwNeedWalletInstanceStatusCheck(state as GlobalState)).toBe(true);
  });

  it("returns true when last check was more than 24 hours ago", () => {
    const date = subHours(new Date(), 25).toISOString();
    const state = buildState(date);
    expect(itwNeedWalletInstanceStatusCheck(state as GlobalState)).toBe(true);
  });

  it("returns false when last check was less than 24 hours ago", () => {
    const date = subHours(new Date(), 23).toISOString();
    const state = buildState(date);
    expect(itwNeedWalletInstanceStatusCheck(state as GlobalState)).toBe(false);
  });

  it("returns false when last check was just now", () => {
    const date = new Date().toISOString();
    const state = buildState(date);
    expect(itwNeedWalletInstanceStatusCheck(state as GlobalState)).toBe(false);
  });
});

describe("itwLastStatusUpdateDateSelector", () => {
  it("returns undefined when lastStatusUpdateDate is not set", () => {
    const state = buildState(undefined);
    expect(
      itwLastStatusUpdateDateSelector(state as GlobalState)
    ).toBeUndefined();
  });

  it("returns the ISO date string when lastStatusUpdateDate is set", () => {
    const date = "2024-01-01T00:00:00.000Z";
    const state = buildState(date);
    expect(itwLastStatusUpdateDateSelector(state as GlobalState)).toBe(date);
  });
});
