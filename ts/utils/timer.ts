import { Millisecond } from "italia-ts-commons/lib/units";
import BackgroundTimer from "react-native-background-timer";

export function startTimer(t: number): Promise<never> {
  // tslint:disable-next-line:promise-must-complete
  return new Promise(resolve => {
    BackgroundTimer.setTimeout(resolve.bind(null), t);
  });
}

export const delayAsync = (milliseconds: Millisecond) =>
  new Promise(r => setTimeout(r, milliseconds));
