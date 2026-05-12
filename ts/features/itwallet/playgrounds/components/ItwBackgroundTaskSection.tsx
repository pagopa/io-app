import {
  Divider,
  IOButton,
  IOToast,
  ListItemHeader,
  ListItemInfo,
  VSpacer
} from "@pagopa/io-app-design-system";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { isDevEnv } from "../../../../utils/environment";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { ITW_STATUS_LIST_FETCH_TASK } from "../../statusList/tasks";

const getAlertMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const getBackgroundTaskStatusLabel = (
  status?: BackgroundTask.BackgroundTaskStatus
) => {
  switch (status) {
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

export const ItwBackgroundTaskSection = () => {
  const [status, setStatus] = useState<BackgroundTask.BackgroundTaskStatus>();
  const [isTaskRegistered, setIsTaskRegistered] = useState<boolean>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  const refreshStatus = useCallback(async () => {
    setIsRefreshing(true);

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
      IOToast.show("Background task worker triggered");
      await refreshStatus();
    } catch (error) {
      Alert.alert("Background task test failed", getAlertMessage(error));
    } finally {
      setIsTriggering(false);
    }
  }, [refreshStatus]);

  useOnFirstRender(
    () => {
      void refreshStatus();
    },
    () => isDevEnv
  );

  if (!isDevEnv) {
    return null;
  }

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
      <ListItemInfo label="Task name" value={ITW_STATUS_LIST_FETCH_TASK} />
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
      <VSpacer size={8} />
      <IOButton
        variant="outline"
        label="Refresh background task status"
        onPress={() => {
          void refreshStatus();
        }}
        loading={isRefreshing}
        disabled={isRefreshing}
      />
    </View>
  );
};
