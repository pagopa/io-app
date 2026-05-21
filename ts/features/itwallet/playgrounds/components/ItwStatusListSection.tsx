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
import { useCallback, useEffect, useState } from "react";
import { Alert, View } from "react-native";
import { isDevEnv } from "../../../../utils/environment";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { ITW_STATUS_LIST_FETCH_TASK } from "../../statusList/tasks";
import { getLastStatusListCheckTimestamp } from "../../statusList/utils/storage";

export const ItwStatusListSection = () => {
  const [lastCheck, setLastCheck] = useState<string>();
  const [age, setAge] = useState<string>("n/a");

  useEffect(() => {
    getLastStatusListCheckTimestamp()
      .then(timestamp => {
        if (timestamp) {
          const lastCheckDate = new Date(timestamp);
          setLastCheck(lastCheckDate.toLocaleString());

          const ageMinutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
          setAge(`${ageMinutes} minutes`);
        }
      })
      .catch(() => setLastCheck("n/a"));
  }, []);

  return (
    <View>
      <ListItemHeader label="Status List" />
      <ListItemInfo label="Last check" value={lastCheck} />
      <Divider />
      <ListItemInfo label="Age" value={age} />
      <VSpacer size={16} />
      <IOButton
        variant="solid"
        label="Refresh Status List"
        onPress={() => null}
        loading={false}
        disabled={true}
      />
      <IOButton
        variant="solid"
        color="danger"
        label="Clear Status List"
        onPress={() => null}
        loading={false}
        disabled={true}
      />
      {__DEV__ && <BackgroundTaskSection />}
    </View>
  );
};

const BackgroundTaskSection = () => {
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
