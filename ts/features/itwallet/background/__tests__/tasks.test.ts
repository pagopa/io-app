import * as BackgroundTask from "expo-background-task";
import { runSaga } from "redux-saga";
import { testSaga } from "redux-saga-test-plan";
import {
  checkWalletInstanceAndCredentialsValiditySaga,
  registerItwBackgroundTaskSaga
} from "../../common/saga";
import { trackItwBackgroundFetchWakeUp } from "../../analytics";
import { itwNeedWalletInstanceStatusCheck } from "../../walletInstance/store/selectors";
import { itwWalletCheckTaskHandler } from "../tasks";
import { ITW_WALLET_CHECK_TASK } from "../constants";
import { backgroundTaskIntervalMinutes } from "../../../../config";

jest.mock("expo-task-manager", () => ({
  defineTask: jest.fn()
}));

jest.mock("redux-saga", () => ({
  ...jest.requireActual("redux-saga"),
  runSaga: jest.fn()
}));

jest.mock("../../analytics", () => ({
  trackItwBackgroundFetchWakeUp: jest.fn()
}));

jest.mock("../../walletInstance/store/selectors", () => ({
  itwNeedWalletInstanceStatusCheck: jest.fn()
}));

jest.mock("../../common/saga", () => ({
  ...jest.requireActual("../../common/saga"),
  checkWalletInstanceAndCredentialsValiditySaga: jest.fn()
}));

jest.mock("../../../../boot/configureStoreAndPersistor", () => ({
  store: {
    getState: jest.fn(),
    dispatch: jest.fn(),
    subscribe: jest.fn()
  }
}));

const mockStore = jest.requireMock(
  "../../../../boot/configureStoreAndPersistor"
).store;
const mockRunSaga = runSaga as jest.Mock;
const mockNeedCheck = itwNeedWalletInstanceStatusCheck as jest.Mock;
const mockTrackWakeUp = trackItwBackgroundFetchWakeUp as jest.Mock;

describe("ITW_WALLET_CHECK_TASK", () => {
  it("has the correct task name", () => {
    expect(ITW_WALLET_CHECK_TASK).toBe("io-itw-wallet-instance-check");
  });
});

describe("itwWalletCheckTaskHandler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns Success without running saga when check is not needed", async () => {
    mockNeedCheck.mockReturnValue(false);
    mockStore.getState.mockReturnValue({});

    const result = await itwWalletCheckTaskHandler();

    expect(mockTrackWakeUp).toHaveBeenCalledTimes(1);
    expect(mockRunSaga).not.toHaveBeenCalled();
    expect(result).toBe(BackgroundTask.BackgroundTaskResult.Success);
  });

  it("runs the validity saga and returns Success when check is needed", async () => {
    mockNeedCheck.mockReturnValue(true);
    mockStore.getState.mockReturnValue({});
    const mockSagaTask = { toPromise: jest.fn().mockResolvedValue(undefined) };
    mockRunSaga.mockReturnValue(mockSagaTask);

    const result = await itwWalletCheckTaskHandler();

    expect(mockTrackWakeUp).toHaveBeenCalledTimes(1);
    expect(mockRunSaga).toHaveBeenCalledWith(
      mockStore,
      checkWalletInstanceAndCredentialsValiditySaga
    );
    expect(result).toBe(BackgroundTask.BackgroundTaskResult.Success);
  });

  it("returns Failed when the saga throws an error", async () => {
    mockNeedCheck.mockReturnValue(true);
    mockStore.getState.mockReturnValue({});
    mockRunSaga.mockReturnValue({
      toPromise: jest.fn().mockRejectedValue(new Error("saga error"))
    });

    const result = await itwWalletCheckTaskHandler();

    expect(result).toBe(BackgroundTask.BackgroundTaskResult.Failed);
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
        minimumInterval: backgroundTaskIntervalMinutes
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
