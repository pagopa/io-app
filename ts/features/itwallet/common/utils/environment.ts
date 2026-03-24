import { ItwVersion } from "@pagopa/io-react-native-wallet";
import Config from "react-native-config";

export type EnvType = "pre" | "prod";

export type Env = {
  type: EnvType;
  WALLET_PROVIDER_BASE_URL: string;
  WALLET_PID_PROVIDER_BASE_URL: ItwSpecsEnvVar;
  WALLET_EAA_PROVIDER_BASE_URL: ItwSpecsEnvVar;
  WALLET_TA_BASE_URL: string;
  REDIRECT_URI: string;
  GOOGLE_CLOUD_PROJECT_NUMBER: string;
  VERIFIER_BASE_URL: string;
  ISSUANCE_REDIRECT_URI: string;
  X509_CERT_ROOT: string;
  BYPASS_IDENTITY_MATCH: boolean;
};

/**
 * Wrapper for an env variable that has different values for each IT-Wallet specs version.
 *
 * Call `.value()` to get the value for the specified version.
 *
 * @example
 * myVar.value("1.3.3")
 */
class ItwSpecsEnvVar {
  constructor(private values: Record<ItwVersion, string>) {}

  value(version: ItwVersion) {
    return this.values[version];
  }
}

export const getEnv = (env: EnvType): Env => {
  switch (env) {
    case "pre":
      return {
        type: "pre",
        WALLET_PROVIDER_BASE_URL: Config.ITW_PRE_WALLET_PROVIDER_BASE_URL,
        WALLET_PID_PROVIDER_BASE_URL: new ItwSpecsEnvVar({
          "1.0.0": Config.ITW_PRE_WALLET_PID_PROVIDER_BASE_URL_V1_0,
          "1.3.3": Config.ITW_PRE_WALLET_PID_PROVIDER_BASE_URL_V1_3
        }),
        WALLET_EAA_PROVIDER_BASE_URL: new ItwSpecsEnvVar({
          "1.0.0": Config.ITW_PRE_WALLET_EAA_PROVIDER_BASE_URL_V1_0,
          "1.3.3": Config.ITW_PRE_WALLET_EAA_PROVIDER_BASE_URL_V1_3
        }),
        WALLET_TA_BASE_URL: Config.ITW_PRE_WALLET_TA_BASE_URL,
        REDIRECT_URI: Config.ITW_PRE_REDIRECT_URI,
        GOOGLE_CLOUD_PROJECT_NUMBER: Config.ITW_PRE_GOOGLE_CLOUD_PROJECT_NUMBER,
        VERIFIER_BASE_URL: Config.ITW_PRE_VERIFIER_BASE_URL,
        ISSUANCE_REDIRECT_URI: Config.ITW_PRE_ISSUANCE_REDIRECT_URI,
        X509_CERT_ROOT: Config.ITW_PRE_X509_CERT_ROOT,
        BYPASS_IDENTITY_MATCH: true
      };
    default:
      return {
        type: "prod",
        WALLET_PROVIDER_BASE_URL: Config.ITW_PROD_WALLET_PROVIDER_BASE_URL,
        WALLET_PID_PROVIDER_BASE_URL: new ItwSpecsEnvVar({
          "1.0.0": Config.ITW_PROD_WALLET_PID_PROVIDER_BASE_URL_V1_0,
          "1.3.3": Config.ITW_PROD_WALLET_PID_PROVIDER_BASE_URL_V1_3
        }),
        WALLET_EAA_PROVIDER_BASE_URL: new ItwSpecsEnvVar({
          "1.0.0": Config.ITW_PROD_WALLET_EAA_PROVIDER_BASE_URL_V1_0,
          "1.3.3": Config.ITW_PROD_WALLET_EAA_PROVIDER_BASE_URL_V1_3
        }),
        WALLET_TA_BASE_URL: Config.ITW_PROD_WALLET_TA_BASE_URL,
        REDIRECT_URI: Config.ITW_PROD_REDIRECT_URI,
        GOOGLE_CLOUD_PROJECT_NUMBER:
          Config.ITW_PROD_GOOGLE_CLOUD_PROJECT_NUMBER,
        VERIFIER_BASE_URL: Config.ITW_PROD_VERIFIER_BASE_URL,
        ISSUANCE_REDIRECT_URI: Config.ITW_PROD_ISSUANCE_REDIRECT_URI,
        X509_CERT_ROOT: Config.ITW_PROD_X509_CERT_ROOT,
        BYPASS_IDENTITY_MATCH: Config.ITW_BYPASS_IDENTITY_MATCH === "YES"
      };
  }
};
