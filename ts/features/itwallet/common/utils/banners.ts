import { addDays, addYears } from "date-fns";
import { NonEmptyArray } from "../../../../types/helpers";

/**
 * Defines the policy to hide a banner
 */
export type BannerHiddenPolicy =
  /** The banners stays closed until wallet reset or app reinstallation */
  | { kind: "always" }
  /** The banner stays closed for a duration of time (in days) */
  | { kind: "duration"; amount: number }
  /** The banner stays closed for a progressive duration of time based on dismiss count */
  | { kind: "progressive-durations"; amounts: NonEmptyArray<number> };

/**
 * Defines the current hidden state of a banner
 */
export type BannerHiddenState = {
  /** The date until which the banner is hidden */
  hiddenUntil: string | undefined;
  /** How many times the banner was dismissed */
  dismissCount: number;
};

/**
 * Computes the next state of a banner based on its hiding policy and current state
 * @param policy - the hiding policy for the banner
 * @param currentState - the current hidden state of the banner
 * @returns the next hidden state of the banner
 */
export const getNextBannerState = (
  policy: BannerHiddenPolicy,
  { dismissCount }: BannerHiddenState
): BannerHiddenState => {
  if (policy.kind === "always") {
    return {
      hiddenUntil: addYears(new Date(), 100).toISOString(),
      dismissCount: dismissCount + 1
    };
  }

  if (policy.kind === "duration") {
    return {
      hiddenUntil: addDays(new Date(), policy.amount).toISOString(),
      dismissCount: dismissCount + 1
    };
  }

  const durationIndex = Math.min(dismissCount, policy.amounts.length - 1);
  const hiddenUntil = addDays(new Date(), policy.amounts[durationIndex]);
  return {
    hiddenUntil: hiddenUntil.toISOString(),
    dismissCount: dismissCount + 1
  };
};
