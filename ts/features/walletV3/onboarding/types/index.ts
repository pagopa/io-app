/**
 * All the possible outcomes of the onboarding process
 * 0: success
 * 1: error
 * TODO: Wait for the pagoPA Team to define the other outcomes
 */
export type OnboardingOutcome = "0" | "1" | "2" | "3";

export type OnboardingStatus = "SUCCESS" | "FAILURE" | "ERROR";

/**
 * Rapresents the result of onboarding process when it is successfully done
 */
export type OnboardingSuccess = {
  status: "SUCCESS";
  outcome: OnboardingOutcome;
};

/**
 * Rapresents the result of onboarding process when it is failed by the returned webview outcome
 */
export type OnboardingFailure = {
  status: "FAILURE";
  outcome: OnboardingOutcome;
};

/**
 * Rapresents the result of onboarding process when it has a generic error not based on the webview outcome
 */
export type OnboardingError = {
  status: "ERROR";
  outcome?: OnboardingOutcome;
};

export type OnboardingResult =
  | OnboardingSuccess
  | OnboardingFailure
  | OnboardingError;
