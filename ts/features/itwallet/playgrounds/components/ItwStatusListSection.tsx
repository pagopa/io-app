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
import { View } from "react-native";
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
  const [isTaskRegistered, setIsTaskRegistered] = useState<boolean>();

  const getAlertMessage = (error: unknown) =>
    error instanceof Error ? error.message : String(error);

  const getTaskRegistrationLabel = (isRegistered?: boolean) => {
    if (isRegistered === undefined) {
      return "Unknown";
    }
    return isRegistered ? "Registered" : "Not registered";
  };

  const refreshStatus = useCallback(async () => {
    try {
      const taskRegistered = await TaskManager.isTaskRegisteredAsync(
        ITW_STATUS_LIST_FETCH_TASK
      );
      setIsTaskRegistered(taskRegistered);
    } catch (error) {
      toast.error(`Background task status failed: ${getAlertMessage(error)}`);
    }
  }, [toast]);

  useOnFirstRender(() => {
    void refreshStatus();
  });

  const triggerTaskWorker = useCallback(async () => {
    try {
      await BackgroundTask.triggerTaskWorkerForTestingAsync();
      toast.show("Background task worker triggered");
    } catch (error) {
      toast.error(`Background task test failed: ${getAlertMessage(error)}`);
    }
  }, [toast]);

  return (
    <View>
      <ListItemHeader label="Background task" />
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
            disabled={isTaskRegistered !== true}
          />
        </>
      )}
    </View>
  );
};
