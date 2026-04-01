import * as BackgroundTask from "expo-background-task";
import { testSaga } from "redux-saga-test-plan";
import {
  ITW_BACKGROUND_TASK_INTERVAL_MINUTES,
  ITW_WALLET_CHECK_TASK
} from "../constants";
import { registerItwBackgroundTaskSaga } from "../saga";

jest.mock("expo-background-task", () => ({
  BackgroundTaskStatus: { Available: 2, Restricted: 1 },
  BackgroundTaskResult: { Success: 1, Failed: 2 },
  getStatusAsync: jest.fn(),
  registerTaskAsync: jest.fn(),
  unregisterTaskAsync: jest.fn(),
  triggerTaskWorkerForTestingAsync: jest.fn(),
  addExpirationListener: jest.fn(() => ({ remove: jest.fn() }))
}));

describe("ITW_WALLET_CHECK_TASK", () => {
  it("has the correct task name", () => {
    expect(ITW_WALLET_CHECK_TASK).toBe("io-itw-wallet-check");
  });
});

describe("registerItwBackgroundTaskSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers the task when background tasks are available", () => {
    testSaga(registerItwBackgroundTaskSaga)
      .next()
      .call(BackgroundTask.getStatusAsync)
      .next(BackgroundTask.BackgroundTaskStatus.Available)
      .call(BackgroundTask.registerTaskAsync, ITW_WALLET_CHECK_TASK, {
        minimumInterval: ITW_BACKGROUND_TASK_INTERVAL_MINUTES
      })
      .next()
      .isDone();
  });

  it("does not register the task when background tasks are restricted", () => {
    testSaga(registerItwBackgroundTaskSaga)
      .next()
      .call(BackgroundTask.getStatusAsync)
      .next(BackgroundTask.BackgroundTaskStatus.Restricted)
      .isDone();
  });
});
