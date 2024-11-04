import { GlobalState } from "../../../../store/reducers/types";

interface PollForStoreValueOptions<T> {
  state: GlobalState;
  selector: (state: GlobalState) => T;
  condition: (value: T) => boolean;
  interval?: number;
  timeout?: number;
}

/**
 * Polls the Redux store until the selected value meets the specified condition.
 * @param state The Redux store state.
 * @param selector A function that selects the value from the store.
 * @param condition A function that checks if the value meets the desired condition.
 * @param interval The interval in milliseconds between each check.
 * @param timeout The maximum time in milliseconds to wait for the condition to be met.
 * @returns A promise that resolves with the store value once the condition is met.
 */
export const pollForStoreValue = <T>({
  state,
  selector,
  condition,
  interval = 1000,
  timeout = 10000
}: PollForStoreValueOptions<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    const startTime = Date.now();

    const checkCondition = () => {
      const value = selector(state);

      if (condition(value)) {
        resolve(value);
        return;
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error("Timeout exceeded while waiting for store value"));
        return;
      }
      setTimeout(checkCondition, interval);
    };
    checkCondition();
  });
