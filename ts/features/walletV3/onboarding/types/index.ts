/**
 * All the possible outcomes of the onboarding process
 */
export enum OnboardingOutcomeEnum {
  SUCCESS = "0",
  GENERIC_ERROR = "1",
  AUTH_ERROR = "2",
  TIMEOUT = "4",
  CANCELED_BY_USER = "8",
  INVALID_SESSION = "14"
}

export type OnboardingOutcome = `${OnboardingOutcomeEnum}`;

export type OnboardingStatus = "SUCCESS" | "FAILURE" | "ERROR";

export type OnboardingOutcomeFailure = Exclude<
  OnboardingOutcome,
  `${OnboardingOutcomeEnum.SUCCESS}`
>;

export type OnboardingOutcomeSuccess = Extract<
  OnboardingOutcome,
  `${OnboardingOutcomeEnum.SUCCESS}`
>;

/**
 * Rapresents the result of onboarding process when it is successfully done
 */
export type OnboardingSuccess = {
  status: "SUCCESS";
  outcome: OnboardingOutcome;
  walletId: string;
};

/**
 * Rapresents the result of onboarding process when it is failed by the returned webview outcome
 */
export type OnboardingFailure = {
  status: "FAILURE";
  outcome: OnboardingOutcomeFailure;
};

/**
 * Rapresents the result of onboarding process when it has a generic error not based on the webview outcome
 */
export type OnboardingWebViewError = {
  status: "ERROR";
  outcome: OnboardingOutcomeFailure;
};

export type OnboardingResult =
  | OnboardingSuccess
  | OnboardingFailure
  | OnboardingWebViewError;
