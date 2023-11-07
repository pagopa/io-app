import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/lib/Option";

import URLParse from "url-parse";
import {
  OnboardingError,
  OnboardingOutcome,
  OnboardingResult,
  OnboardingStatus
} from "../types";
import { isStringNullyOrEmpty } from "../../../../utils/strings";

// List of outcomes that are considered successful
export const successOutcomes: ReadonlyArray<OnboardingOutcome> = ["0"];

export const ONBOARDING_OUTCOME_PATH = "/outcomeView";

/**
 * Function to get the onboarding status from the given outcome
 * @param outcome outcome to get the status from
 * @returns the status of the onboarding
 */
export const getOutcomeStatus = (
  outcome: OnboardingOutcome
): OnboardingStatus =>
  successOutcomes.includes(outcome) ? "SUCCESS" : "FAILURE";

/**
 * Function to extract the onboarding result from the url of the webview
 * It will return a {@link OnboardingError} if the url is not from the onboarding result page
 * @param url url to extract the onboarding result from
 * @returns an {@link OnboardingResult}
 */
export const extractOnboardingResult = (url: string): OnboardingResult =>
  pipe(
    new URLParse(url, true),
    O.fromPredicate(urlParse =>
      urlParse.pathname.includes(ONBOARDING_OUTCOME_PATH)
    ),
    O.map(urlParse => ({
      outcome: urlParse.query.outcome as OnboardingOutcome,
      walletId: urlParse.query.walletId as string
    })),
    O.filter(result => !isStringNullyOrEmpty(result.outcome)),
    O.map(result => ({
      status: getOutcomeStatus(result.outcome),
      outcome: result.outcome,
      walletId: result.walletId
    })),
    O.getOrElseW(() => ({ status: "ERROR" } as OnboardingError))
  );
