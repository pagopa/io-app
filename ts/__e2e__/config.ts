import { device } from "detox";
import { Millisecond } from "@pagopa/ts-commons/lib/units";

// 10 seconds seems a lot in development, but lower values are causing false positives
// on the CI environment. Don't touch it if you don't know what you are doing.
export const e2eWaitRenderTimeout = (15 * 1000) as Millisecond;
export const e2ePinChar1 = "1";
export const e2ePinChar2 = "2";
export const e2ePinChar3 = "3";
export const e2ePinChar4 = "4";
export const e2ePinChar5 = "5";
export const e2ePinChar6 = "6";

// We need to extract the argument type because is not exported
type DetoxLaunchAppConfig = Parameters<typeof device.launchApp>[0];

export const launchAppConfig: DetoxLaunchAppConfig = {
  permissions: { notifications: "YES", camera: "YES", photos: "YES" }
};
