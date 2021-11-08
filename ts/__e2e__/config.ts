// 10 seconds seems a lot in development, but lower values are causing false positives
// on the CI environment. Don't touch it if you don't know what you are doing.
import { Millisecond } from "italia-ts-commons/lib/units";

export const e2eWaitRenderTimeout = (10 * 1000) as Millisecond;
export const e2ePinChar = "2";
