import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

export type AndroidCiedIdPackageName =
  | "it.ipzs.cieid"
  | "it.ipzs.cieid.coll"
  | "it.ipzs.cieid.collaudo";
/**
 * Selects the installed CIE ID application; only production verifies its
 * certificate.
 */
export type CieIdEnvironment = "coll" | "preprod" | "production";
export type CieIdErrorResult = {
  code: CieIdModuleErrorCodes;
  id: "ERROR";
  userInfo?: Record<string, string>;
};

export type CieIdModuleErrorCodes =
  | "AUTHENTICATION_ERROR"
  | "CIE_NOT_REGISTERED"
  | "CIEID_ACTIVITY_IS_NULL"
  | "CIEID_EMPTY_URL_AND_ERROR_EXTRAS"
  | "CIEID_OPERATION_CANCEL"
  | "CIEID_OPERATION_NOT_SUCCESSFUL"
  | "CIEID_SIGNATURE_MISMATCH"
  | "GENERIC_ERROR"
  | "NO_SECURE_DEVICE"
  | "REACT_ACTIVITY_IS_NULL"
  | "UNKNOWN_EXCEPTION";

export type CieIdPackageNameOrCustomUrl =
  | AndroidCiedIdPackageName
  | IosCieIdUrlScheme;

/** The redirect URL or authentication error returned by CIE ID on Android. */
export type CieIdReturnType = CieIdErrorResult | CieIdSuccessResult;
export type CieIdSuccessResult = { id: "URL"; url: string };
export type IosCieIdUrlScheme = "CIEID://";

interface ExpoCieIdModuleType {
  isAppInstalled: (packageName: string, signature: null | string) => boolean;
  launchCieIdForResult: (
    packageName: AndroidCiedIdPackageName,
    className: string,
    signature: null | string,
    url: string
  ) => Promise<CieIdReturnType>;
}

const ExpoCieIdModule = requireNativeModule<ExpoCieIdModuleType>("ExpoCieId");
const CIEID_SIGNATURE =
  "92:D1:35:40:D4:50:F6:9F:79:2C:5F:3C:77:0A:E2:85:5B:FB:23:58:B4:47:A8:DE:06:4D:51:D0:35:8E:B6:97";
const CIEID_ACTIVITY = "it.ipzs.cieid.BaseActivity";
const CIEID_PACKAGE_NAME_BY_ENVIRONMENT: Record<
  CieIdEnvironment,
  AndroidCiedIdPackageName
> = {
  production: "it.ipzs.cieid",
  preprod: "it.ipzs.cieid.collaudo",
  coll: "it.ipzs.cieid.coll"
};

const getCieIdSignature = (environment: CieIdEnvironment) =>
  environment === "production" ? CIEID_SIGNATURE : null;

/**
 * Checks CIE ID availability synchronously, validating the production
 * certificate on Android. iOS requires CIEID in the host application's
 * LSApplicationQueriesSchemes. Android package visibility declarations are
 * supplied by this module's manifest.
 */
export function isCieIdAvailable(
  environment: CieIdEnvironment = "production"
): boolean {
  return Platform.OS === "ios"
    ? ExpoCieIdModule.isAppInstalled("CIEID", null)
    : ExpoCieIdModule.isAppInstalled(
        CIEID_PACKAGE_NAME_BY_ENVIRONMENT[environment],
        getCieIdSignature(environment)
      );
}

/**
 * Starts Android CIE ID authentication and forwards its result to the callback.
 * On iOS the caller must use Linking.openURL and handle the incoming redirect
 * instead.
 */
export function openCieIdApp(
  forwardUrl: string,
  callback: (result: CieIdReturnType) => void,
  environment: CieIdEnvironment = "production"
): void {
  if (Platform.OS === "ios") {
    throw new Error(
      "openCieIdApp is not available on iOS. Use Linking.openURL instead."
    );
  }
  void ExpoCieIdModule.launchCieIdForResult(
    CIEID_PACKAGE_NAME_BY_ENVIRONMENT[environment],
    CIEID_ACTIVITY,
    getCieIdSignature(environment),
    forwardUrl
  ).then(callback, () => callback({ id: "ERROR", code: "UNKNOWN_EXCEPTION" }));
}
