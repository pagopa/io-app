import { ItwVersion } from "@pagopa/io-react-native-wallet";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";

import { ITW_STATUS_LIST_FETCH_TASK, registerItwStatusListFetchTask } from "..";
import {
  trackItwStatusListFetchRegistered,
  trackItwStatusListFetchRegisterFailure
} from "../../analytics";
import { refreshStaleEntries } from "../../utils/refresh";
import { getItwSpecsVersion, storeItwSpecsVersion } from "../../utils/storage";

jest.mock("../../analytics", () => ({
  trackItwStatusListFetchRegistered: jest.fn(),
  trackItwStatusListFetchRegisterFailure: jest.fn()
}));
jest.mock("../../utils/refresh", () => ({
  refreshStaleEntries: jest.fn()
}));
jest.mock("../../utils/storage", () => ({
  getItwSpecsVersion: jest.fn(),
  storeItwSpecsVersion: jest.fn()
}));

const mockDefineTask = jest.mocked(TaskManager.defineTask);
const mockIsTaskRegistered = jest.mocked(TaskManager.isTaskRegisteredAsync);
const mockRegisterTask = jest.mocked(BackgroundTask.registerTaskAsync);
const mockGetItwSpecsVersion = jest.mocked(getItwSpecsVersion);
const mockStoreItwSpecsVersion = jest.mocked(storeItwSpecsVersion);
const mockRefreshStaleEntries = jest.mocked(refreshStaleEntries);
const mockTrackRegistered = jest.mocked(trackItwStatusListFetchRegistered);
const mockTrackRegisterFailure = jest.mocked(
  trackItwStatusListFetchRegisterFailure
);

const taskExecutor = mockDefineTask.mock.calls.find(
  ([taskName]) => taskName === ITW_STATUS_LIST_FETCH_TASK
)?.[1];

if (!taskExecutor) {
  throw new Error("ITW Status List background task is not defined");
}

const taskBody = {
  data: {},
  error: null,
  executionInfo: {
    eventId: "event-id",
    taskName: ITW_STATUS_LIST_FETCH_TASK
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  mockIsTaskRegistered.mockResolvedValue(false);
  mockRegisterTask.mockResolvedValue(undefined);
  mockStoreItwSpecsVersion.mockResolvedValue(undefined);
  mockRefreshStaleEntries.mockResolvedValue(undefined);
});

describe("ITW Status List background task", () => {
  it("refreshes stale entries using the stored IT-Wallet specs version", async () => {
    mockGetItwSpecsVersion.mockResolvedValue("1.4.6");

    await expect(taskExecutor(taskBody)).resolves.toBe(
      BackgroundTask.BackgroundTaskResult.Success
    );
    expect(mockRefreshStaleEntries).toHaveBeenCalledWith({
      itwVersion: "1.4.6"
    });
  });

  it("fails when the IT-Wallet specs version cannot be read", async () => {
    mockGetItwSpecsVersion.mockRejectedValue(new Error("missing version"));

    await expect(taskExecutor(taskBody)).resolves.toBe(
      BackgroundTask.BackgroundTaskResult.Failed
    );
    expect(mockRefreshStaleEntries).not.toHaveBeenCalled();
  });
});

describe("registerItwStatusListFetchTask", () => {
  it("stores the current specs version before registering the task", async () => {
    const itwVersion: ItwVersion = "1.4.6";

    await registerItwStatusListFetchTask(itwVersion);

    expect(mockStoreItwSpecsVersion).toHaveBeenCalledWith(itwVersion);
    expect(mockStoreItwSpecsVersion.mock.invocationCallOrder[0]).toBeLessThan(
      mockIsTaskRegistered.mock.invocationCallOrder[0]
    );
    expect(mockRegisterTask).toHaveBeenCalledWith(ITW_STATUS_LIST_FETCH_TASK, {
      minimumInterval: 60 * 12
    });
    expect(mockTrackRegistered).toHaveBeenCalledTimes(1);
  });

  it("updates the stored specs version when the task is already registered", async () => {
    mockIsTaskRegistered.mockResolvedValue(true);

    await registerItwStatusListFetchTask("1.4.6");

    expect(mockStoreItwSpecsVersion).toHaveBeenCalledWith("1.4.6");
    expect(mockRegisterTask).not.toHaveBeenCalled();
  });

  it("does not register the task when storing the specs version fails", async () => {
    mockStoreItwSpecsVersion.mockRejectedValue(new Error("storage failure"));

    await registerItwStatusListFetchTask("1.4.6");

    expect(mockIsTaskRegistered).not.toHaveBeenCalled();
    expect(mockRegisterTask).not.toHaveBeenCalled();
    expect(mockTrackRegisterFailure).toHaveBeenCalledWith("storage failure");
  });
});
