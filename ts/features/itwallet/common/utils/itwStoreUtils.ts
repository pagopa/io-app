import { GlobalState } from "../../../../store/reducers/types";

interface PollForStoreValueOptions<T> {
  getState: () => GlobalState;
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
  getState,
  selector,
  condition,
  interval = 1000,
  timeout = 10000
}: PollForStoreValueOptions<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    const startTime = Date.now();

    // Avoid starting polling if the condition is already met
    const initialValue = selector(getState());
    if (condition(initialValue)) {
      resolve(initialValue);
      return;
    }

    const intervalId = setInterval(() => {
      const currentTime = Date.now();
      const value = selector(getState());

      if (condition(value)) {
        clearInterval(intervalId);
        resolve(value);
      } else if (currentTime - startTime >= timeout) {
        clearInterval(intervalId);
        reject(new Error("Timeout exceeded while waiting for store value"));
      }
    }, interval);
  });
