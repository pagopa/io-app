import BackgroundTimer from "react-native-background-timer";

export function resolveAfterMillis(t: number): Promise<never> {
  // tslint:disable-next-line:promise-must-complete
  return new Promise(resolve => {
    BackgroundTimer.setTimeout(resolve.bind(null), t);
  });
}
