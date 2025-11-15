import { IOColors, IOIcons } from "@pagopa/io-app-design-system";

/**
 * Defines the number of asterisks used to mask the value of claims in the credential details
 */
export const HIDDEN_CLAIM_TEXT = "******";

/**
 * The new Wallet L3 background color
 */
export const WALLET_L3_BG_COLOR = IOColors["blueIO-500"];
/**
 * Defines the colors used in the gradient of the ITW components
 */
export const itwGradientColors = [
  "#0B3EE3",
  "#234FFF",
  "#436FFF",
  "#2F5EFF",
  "#1E53FF",
  "#1848F0",
  "#0B3EE3",
  "#1F4DFF",
  "#2A5CFF",
  "#1943E8",
  "#0B3EE3"
];

/**
 * IT-Wallet ID brand colors
 */
export const IT_WALLET_ID_BG_LIGHT = "#DBE0FF";
export const IT_WALLET_ID_BG = "#A8B4FF";
export const IT_WALLET_ID_GRADIENT = ["#D5D5FF", "#CEE2FA"];

/**
 * IT-Wallet ID logo
 */
export const IT_WALLET_ID_LOGO: IOIcons = "sparkles";

/**
 * Qualtrics survey URLs
 */
export const IT_WALLET_SURVEY_EID_REISSUANCE_SUCCESS =
  "https://pagopa.qualtrics.com/jfe/form/SV_3JmGHi0IjGYESYC";
export const IT_WALLET_SURVEY_EID_REISSUANCE_FAILURE =
  "https://pagopa.qualtrics.com/jfe/form/SV_5bhV8w1e2ujl9xs";
