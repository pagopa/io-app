import {
  Divider,
  IOButton,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  useIOToast,
  VSpacer
} from "@pagopa/io-app-design-system";
import { format } from "date-fns";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { isDevEnv } from "../../../../utils/environment";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { ITW_STATUS_LIST_FETCH_TASK } from "../../statusList/tasks";
import {
  getLastStatusListCheckTimestamp,
  getLastStatusListFetchTimestamp
} from "../../statusList/utils/storage";

const formatDate = (timestamp: number | undefined): string =>
  timestamp ? format(new Date(timestamp), "DD/MM/YY HH:mm:ss") : "n/a";

const formatAge = (lastFetchTime: number | undefined): string => {
  if (!lastFetchTime) {
    return "n/a";
  }

  const diffInMs = Date.now() - lastFetchTime;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${diffInHours}h ${diffInMinutes}m`;
};

export const ItwStatusListSection = () => {
  const [lastCheckTime, setLastCheckTime] = useState<number>();
  const [lastFetchTime, setLastFetchTime] = useState<number>();

  useEffect(() => {
    getLastStatusListCheckTimestamp()
      .then(setLastCheckTime)
      .catch(() => setLastCheckTime(undefined));

    getLastStatusListFetchTimestamp()
      .then(setLastFetchTime)
      .catch(() => setLastFetchTime(undefined));
  }, []);

  return (
    <View>
      <ListItemHeader label="Status List" />
      <ListItemInfo label="Last check" value={formatDate(lastCheckTime)} />
      <Divider />
      <ListItemInfo label="Last fetch" value={formatDate(lastFetchTime)} />
      <Divider />
      <ListItemInfo label="Age" value={formatAge(lastFetchTime)} />
      <VSpacer size={8} />
      <IOButton
        variant="solid"
        label="Refresh Status List"
        onPress={() => null}
        loading={false}
        disabled={true}
      />
      <VSpacer size={8} />
      <IOButton
        variant="solid"
        color="danger"
        label="Clear Status List"
        onPress={() => null}
        loading={false}
        disabled={true}
      />
      <VSpacer size={16} />
      <BackgroundTaskSection />
    </View>
  );
};

const BackgroundTaskSection = () => {
  const toast = useIOToast();
  const [status, setStatus] = useState<BackgroundTask.BackgroundTaskStatus>();
  const [isTaskRegistered, setIsTaskRegistered] = useState<boolean>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const getAlertMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

  const getBackgroundTaskStatusLabel = (
    s?: BackgroundTask.BackgroundTaskStatus
  ) => {
    switch (s) {
      case BackgroundTask.BackgroundTaskStatus.Available:
        return "Available";
      case BackgroundTask.BackgroundTaskStatus.Restricted:
        return "Restricted";
      default:
        return "Unknown";
    }
  };

  const getTaskRegistrationLabel = (isRegistered?: boolean) => {
    if (isRegistered === undefined) {
      return "Unknown";
    }

    return isRegistered ? "Registered" : "Not registered";
  };

  const refreshStatus = useCallback(async () => {
    try {
      const [backgroundTaskStatus, taskRegistered] = await Promise.all([
        BackgroundTask.getStatusAsync(),
        TaskManager.isTaskRegisteredAsync(ITW_STATUS_LIST_FETCH_TASK)
      ]);

      setStatus(backgroundTaskStatus);
      setIsTaskRegistered(taskRegistered);
    } catch (error) {
      Alert.alert("Background task status failed", getAlertMessage(error));
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const triggerTaskWorker = useCallback(async () => {
    setIsTriggering(true);

    try {
      await BackgroundTask.triggerTaskWorkerForTestingAsync();
      toast.show("Background task worker triggered");
      await refreshStatus();
    } catch (error) {
      Alert.alert("Background task test failed", getAlertMessage(error));
    } finally {
      setIsTriggering(false);
    }
  }, [refreshStatus, toast]);

  useOnFirstRender(() => {
    void refreshStatus();
  });

  const isTriggerDisabled =
    isRefreshing ||
    isTriggering ||
    status !== BackgroundTask.BackgroundTaskStatus.Available ||
    isTaskRegistered !== true;

  return (
    <View>
      <ListItemHeader label="Background task" />
      <ListItemInfo
        label="Service availability"
        value={getBackgroundTaskStatusLabel(status)}
      />
      <Divider />
      <ListItemInfo
        label="Task registration"
        value={getTaskRegistrationLabel(isTaskRegistered)}
      />
      <Divider />
      <ListItemInfoCopy
        label="Task name"
        value={ITW_STATUS_LIST_FETCH_TASK}
        onPress={() =>
          clipboardSetStringWithFeedback(ITW_STATUS_LIST_FETCH_TASK)
        }
      />
      {isDevEnv && (
        <>
          <VSpacer size={16} />
          <IOButton
            variant="solid"
            label="Trigger background task worker"
            onPress={() => {
              void triggerTaskWorker();
            }}
            loading={isTriggering}
            disabled={isTriggerDisabled}
          />
        </>
      )}
    </View>
  );
};
