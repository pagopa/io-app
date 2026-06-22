import { Millisecond } from "@pagopa/ts-commons/lib/units";
import BackgroundTimer from "react-native-background-timer";

/**
 * Return a promise that resolve after t milliseconds, even if the app is in background
 * @param t
 */
export function startTimer(t: number): Promise<void> {
  return new Promise(resolve => {
    BackgroundTimer.setTimeout(resolve.bind(null), t);
  });
}

export const delayAsync = (milliseconds: Millisecond) =>
  new Promise<void>(r => setTimeout(r, milliseconds));
