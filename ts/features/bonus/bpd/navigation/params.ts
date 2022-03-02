import BPD_ROUTES from "./routes";

export type BpdOnboardingParamsList = {
  [BPD_ROUTES.ONBOARDING.LOAD_CHECK_ACTIVATION_STATUS]: undefined;
  [BPD_ROUTES.ONBOARDING.INFORMATION_TOS]: undefined;
  [BPD_ROUTES.ONBOARDING.DECLARATION]: undefined;
  [BPD_ROUTES.ONBOARDING.LOAD_ACTIVATE_BPD]: undefined;
  [BPD_ROUTES.ONBOARDING.ENROLL_PAYMENT_METHODS]: undefined;
  [BPD_ROUTES.ONBOARDING.NO_PAYMENT_METHODS]: undefined;
  [BPD_ROUTES.ONBOARDING.ERROR_PAYMENT_METHODS]: undefined;
  [BPD_ROUTES.CTA_START_BPD]: undefined;
};

export type BpdDetailsParamsList = {
  [BPD_ROUTES.DETAILS]: undefined;
  [BPD_ROUTES.TRANSACTIONS]: undefined;
};

export type BpdIbanParamsList = {
  [BPD_ROUTES.IBAN]: undefined;
};

export type BpdOptInParamsList = {
  [BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CASHBACK_UPDATE]: undefined;
  [BPD_ROUTES.OPT_IN_PAYMENT_METHODS.CHOICE]: undefined;
};
