import { type ItwVersion } from "@pagopa/io-react-native-wallet";

/**
 * The IT-Wallet technical specifications version that is currently used by the app.
 */
export const CURRENT_ITW_SPECS_VERSION: ItwVersion = "1.4.6";

/**
 * The minimum IT-Wallet specification version that is backward-compatible with {@link CURRENT_ITW_SPECS_VERSION}.
 * The current IT-Wallet version may increase while still supporting credentials issued with the minimum version.
 */
export const MIN_ITW_SPECS_VERSION = "1.3.3";

/**
 * Defines the number of asterisks used to mask the value of claims in the credential details
 */
export const HIDDEN_CLAIM_TEXT = "******";

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
 * Qualtrics survey URLs
 */
export const IT_WALLET_SURVEY_EID_ACTIVATION_SUCCESS =
  "https://pagopa.qualtrics.com/jfe/form/SV_bK0TKnraVONeI18";
export const IT_WALLET_SURVEY_EID_REISSUANCE_SUCCESS =
  "https://pagopa.qualtrics.com/jfe/form/SV_3JmGHi0IjGYESYC";
export const IT_WALLET_SURVEY_EID_REISSUANCE_FAILURE =
  "https://pagopa.qualtrics.com/jfe/form/SV_5bhV8w1e2ujl9xs";
export const IT_WALLET_SURVEY_EID_ACTIVATION_EXIT =
  "https://pagopa.qualtrics.com/jfe/form/SV_1z4QdFwxGlf2ehg";
export const IT_WALLET_SURVEY_CREDENTIAL_EXIT =
  "https://pagopa.qualtrics.com/jfe/form/SV_736TjZupSi2JQ5E";

/**
 * Fixed Wallet Solution identifier to get the Wallet Instance and Key attestations.
 */
export const WALLET_SOLUTION_ID = "appio";
