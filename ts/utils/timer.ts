import { Millisecond } from "italia-ts-commons/lib/units";
import BackgroundTimer from "react-native-background-timer";

export function startTimer(t: number): Promise<never> {
  // eslint-disable-next-line
  return new Promise(resolve => {
    BackgroundTimer.setTimeout(resolve.bind(null), t);
  });
}

export const delayAsync = (milliseconds: Millisecond) =>
  new Promise<void>(r => setTimeout(r, milliseconds));
