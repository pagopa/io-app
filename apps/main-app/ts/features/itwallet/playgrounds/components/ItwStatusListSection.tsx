import {
  BodyMonospace,
  Divider,
  IOButton,
  ListItemHeader,
  ListItemInfo,
  ListItemInfoCopy,
  ListItemNav,
  useIOToast,
  VSpacer
} from "@io-app/design-system";
import { type CredentialStatus } from "@pagopa/io-react-native-wallet";
import { format } from "date-fns";
import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";

import { clipboardSetStringWithFeedback } from "../../../../utils/clipboard";
import { isDevEnv } from "../../../../utils/environment";
import { useIOBottomSheetModal } from "../../../../utils/hooks/bottomSheet";
import { useOnFirstRender } from "../../../../utils/hooks/useOnFirstRender";
import { ITW_STATUS_LIST_FETCH_TASK } from "../../statusList/tasks";
import { StatusListRepository } from "../../statusList/utils/repository";
import { getLastStatusListCheckTimestamps } from "../../statusList/utils/storage";

const formatDate = (timestamp: number | undefined): string =>
  timestamp !== undefined
    ? format(new Date(timestamp), "DD/MM/YY HH:mm:ss")
    : "n/a";

const formatAge = (lastFetchTime: number | undefined): string => {
  if (lastFetchTime === undefined) {
    return "n/a";
  }

  const diffInMs = Date.now() - lastFetchTime;
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));

  return `${diffInHours}h ${diffInMinutes}m`;
};

const formatTslTimestamp = (timestamp: number | undefined): string =>
  timestamp !== undefined
    ? format(new Date(timestamp * 1000), "DD/MM/YY HH:mm:ss")
    : "n/a";

const getAlertMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

export const ItwStatusListSection = () => {
  const [timestamps, setTimestamps] = useState<ReadonlyArray<number>>();
  const [storedTsls, setStoredTsls] = useState<
    ReadonlyArray<CredentialStatus.StatusList>
  >([]);
  const [selectedTsl, setSelectedTsl] = useState<CredentialStatus.StatusList>();
  const toast = useIOToast();

  useEffect(() => {
    getLastStatusListCheckTimestamps()
      .then(setTimestamps)
      .catch(() => setTimestamps(undefined));

    StatusListRepository.list()
      .then(setStoredTsls)
      .catch(error =>
        toast.error(`Status List storage failed: ${getAlertMessage(error)}`)
      );
  }, [toast]);

  const modal = useIOBottomSheetModal({
    title: "Status List",
    component: (
      <View style={{ flex: 1 }}>
        <FlatList
          contentContainerStyle={{
            flexGrow: 1
          }}
          data={timestamps ?? []}
          keyExtractor={(_, index) => String(index)}
          ListEmptyComponent={
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 24
              }}
            >
              <Text>No check occurred</Text>
            </View>
          }
          renderItem={({ item, index }) => (
            <ListItemInfo
              label={`Check #${index + 1}`}
              value={`${formatDate(item)} (${formatAge(item)} ago)`}
            />
          )}
          scrollEnabled={false}
          style={{ flex: 1 }}
        />
      </View>
    )
  });

  const parsedTslModal = useIOBottomSheetModal({
    title: "Parsed TSL",
    component:
      selectedTsl === undefined ? null : (
        <BodyMonospace selectable>
          {JSON.stringify(selectedTsl, null, 2)}
        </BodyMonospace>
      )
  });

  return (
    <>
      <View>
        <ListItemHeader label="Status List" />
        <ListItemNav
          description={formatDate(timestamps?.at(-1))}
          onPress={() => modal.present()}
          value="Last check"
        />
        <VSpacer size={16} />
        <BackgroundTaskSection />
        <VSpacer size={16} />
        <ListItemHeader label="Stored TSL" />
        {storedTsls.length === 0 ? (
          <ListItemInfo label="Entries" value="No stored TSL" />
        ) : (
          storedTsls.map(tsl => (
            <ListItemNav
              accessibilityLabel={tsl.sub}
              description={`Expires ${formatTslTimestamp(tsl.exp)}`}
              key={tsl.sub}
              onPress={() => {
                setSelectedTsl(tsl);
                parsedTslModal.present();
              }}
              value={tsl.sub}
            />
          ))
        )}
      </View>
      {modal.bottomSheet}
      {parsedTslModal.bottomSheet}
    </>
  );
};

const BackgroundTaskSection = () => {
  const toast = useIOToast();
  const [isTaskRegistered, setIsTaskRegistered] = useState<boolean>();

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
        onPress={() =>
          clipboardSetStringWithFeedback(ITW_STATUS_LIST_FETCH_TASK)
        }
        value={ITW_STATUS_LIST_FETCH_TASK}
      />
      {isDevEnv && (
        <>
          <VSpacer size={16} />
          <IOButton
            disabled={isTaskRegistered !== true}
            label="Trigger background task worker"
            onPress={() => {
              void triggerTaskWorker();
            }}
            variant="solid"
          />
        </>
      )}
    </View>
  );
};
